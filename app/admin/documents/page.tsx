"use client";

import { useState, useRef } from "react";

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  size: string;
  date: string;
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Church Constitution v2.pdf",
    category: "Governance",
    uploadedBy: "Admin Officer",
    size: "1.2 MB",
    date: "2026-06-15",
  },
  {
    id: "doc-2",
    name: "Q2 Financial Statement.xlsx",
    category: "Financial Reports",
    uploadedBy: "Finance Officer",
    size: "840 KB",
    date: "2026-07-02",
  },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [selectedCat, setSelectedCat] = useState("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: DocumentItem[] = Array.from(files).map((f, idx) => ({
      id: `doc-new-${Date.now()}-${idx}`,
      name: f.name,
      category: selectedCat === "All" ? "Governance" : selectedCat,
      uploadedBy: "System Administrator",
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toISOString().split("T")[0],
    }));

    setDocs((prev) => [...newItems, ...prev]);
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const filteredDocs = docs.filter((d) => {
    if (selectedCat === "All") return true;
    return d.category === selectedCat;
  });

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
        <p className="text-slate-600 text-xs mt-1">PDF, Word, Excel, Images up to 50MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Governance", "Financial Reports", "Correspondence", "Ministry", "Legal", "Other"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                selectedCat === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {cat}
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
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No documents found in this category.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{doc.name}</td>
                  <td className="px-4 py-3.5 text-slate-300">{doc.category}</td>
                  <td className="px-4 py-3.5 text-slate-400">{doc.uploadedBy}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{doc.size}</td>
                  <td className="px-4 py-3.5 text-slate-400">{doc.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition cursor-pointer"
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
    </div>
  );
}
