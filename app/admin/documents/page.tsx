"use client";

import { useState, useRef, useEffect } from "react";

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  uploaderFirstName?: string;
  uploaderLastName?: string;
  fileSizeBytes: string;
  createdAt: string;
  fileData: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (json.success) {
        setDocs(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const textContent = event.target?.result as string;
        
        // Ensure there's some text data if it's binary
        const finalContent = textContent || "[Non-text or binary file uploaded successfully]";
        
        // Map selectedCat to valid db enum value. If 'All', use 'other'.
        let backendCat = selectedCat === "All" ? "other" : selectedCat;
        
        const payload = {
          name: f.name,
          category: backendCat,
          fileData: finalContent,
          fileSizeBytes: f.size.toString(),
          fileType: f.name.split('.').pop() || "unknown",
        };

        try {
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (json.success) {
            // Re-fetch to get complete joined data (like uploaderName)
            fetchDocuments();
          } else {
            console.error("Upload failed:", json.error);
          }
        } catch (err) {
          console.error("Failed to upload document", err);
        }
      };
      
      // Read the file content
      reader.readAsText(f);
    }

    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
      } else {
        console.error("Delete failed:", json.error);
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      
      // Add a header/title
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(doc.name, 15, 20);
      
      // Add content
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      // Split text to fit the page width (A4 width is ~210mm, margins 15mm = 180mm content width)
      const lines = pdf.splitTextToSize(doc.fileData || "No content available.", 180);
      pdf.text(lines, 15, 30);
      
      // Determine filename (always ensure .pdf extension)
      const pdfName = doc.name.includes(".") 
        ? doc.name.substring(0, doc.name.lastIndexOf(".")) + ".pdf"
        : doc.name + ".pdf";
        
      pdf.save(pdfName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      // Fallback to text file if jspdf fails to load
      const blob = new Blob([doc.fileData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name + ".txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const filteredDocs = docs.filter((d) => {
    if (selectedCat !== "All" && d.category !== selectedCat) return false;
    return true;
  });

  const formatSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (isNaN(size) || size === 0) return "Unknown";
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
      church_policy: "Church Policy",
      financial_receipt: "Financial Receipt",
      expense_receipt: "Expense Receipt",
      meeting_minutes: "Meeting Minutes",
      member_form: "Member Form",
      other: "Other",
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">Upload and manage church documents</p>
        </div>
        <button
          onClick={handleBrowse}
          id="upload-doc-btn"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Upload drop zone */}
      <div
        onClick={handleBrowse}
        className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-indigo-500/40 transition cursor-pointer"
      >
        <svg
          className="w-10 h-10 mx-auto text-slate-600 mb-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-slate-400 text-sm">Drag and drop files here, or click to browse</p>
        <p className="text-slate-600 text-xs mt-1">PDF, Word, Excel, Images, Text up to 50MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv,.json"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "All", label: "All" },
          { id: "church_policy", label: "Church Policy" },
          { id: "financial_receipt", label: "Financial Receipts" },
          { id: "expense_receipt", label: "Expense Receipts" },
          { id: "meeting_minutes", label: "Meeting Minutes" },
          { id: "member_form", label: "Member Forms" },
          { id: "other", label: "Other" },
        ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                selectedCat === cat.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          )
        )}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30 text-slate-400">
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Uploaded By</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No documents found in this category.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{doc.name}</td>
                  <td className="px-4 py-3.5 text-slate-300">{formatCategory(doc.category)}</td>
                  <td className="px-4 py-3.5 text-slate-400">{doc.uploaderFirstName ? `${doc.uploaderFirstName} ${doc.uploaderLastName}` : "Unknown"}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{formatSize(doc.fileSizeBytes)}</td>
                  <td className="px-4 py-3.5 text-slate-400">{formatDate(doc.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded hover:bg-indigo-500/10 transition cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded hover:bg-emerald-500/10 transition cursor-pointer"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2.5 py-1 rounded hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-white">{viewingDoc.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatCategory(viewingDoc.category)} • Uploaded by {viewingDoc.uploaderFirstName ? `${viewingDoc.uploaderFirstName} ${viewingDoc.uploaderLastName}` : "Unknown"} • {formatDate(viewingDoc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(viewingDoc)}
                  className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded text-sm font-medium transition cursor-pointer"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950">
              {viewingDoc.fileData ? (
                <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {viewingDoc.fileData}
                </pre>
              ) : (
                <div className="text-center text-slate-500 py-20 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Document content cannot be displayed directly.</p>
                  <p className="text-sm mt-1">Please download the file to view it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
