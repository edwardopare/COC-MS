import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">Upload and manage church documents</p>
        </div>
        <button id="upload-doc-btn" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Upload Document
        </button>
      </div>

      {/* Upload drop zone */}
      <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-indigo-500/40 transition cursor-pointer">
        <svg className="w-10 h-10 mx-auto text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        <p className="text-slate-400 text-sm">Drag and drop files here, or click to browse</p>
        <p className="text-slate-600 text-xs mt-1">PDF, Word, Excel, Images up to 50MB</p>
        <input type="file" className="hidden" id="file-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Governance", "Financial Reports", "Correspondence", "Ministry", "Legal", "Other"].map(cat => (
          <button key={cat} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition">{cat}</button>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Document</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Uploaded By</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Size</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Connect Vercel Blob storage and database to manage documents.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
