"use client";

import { useState, useEffect } from "react";
import { Users, Save, History, Activity, CalendarDays, Pencil, X } from "lucide-react";

interface AttendanceRecord {
  id: string;
  serviceType: string;
  attendanceDate: string;
  maleCount: number;
  femaleCount: number;
  childrenCount: number;
  visitorsCount: number;
  totalCount: number;
  offertoryAmount: string;
  notes?: string;
}

export default function AttendancePage() {
  const [serviceType, setServiceType] = useState("sunday_service");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [male, setMale] = useState<number | "">("");
  const [female, setFemale] = useState<number | "">("");
  const [children, setChildren] = useState<number | "">("");
  const [visitors, setVisitors] = useState<number | "">("");
  const [offertory, setOffertory] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Edit modal state
  const [editRec, setEditRec] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const editTotal = (Number(editForm.male) || 0) + (Number(editForm.female) || 0) + (Number(editForm.children) || 0) + (Number(editForm.visitors) || 0);

  const openEdit = (rec: AttendanceRecord) => {
    setEditError("");
    setEditRec(rec);
    setEditForm({
      date: rec.attendanceDate ? rec.attendanceDate.split("T")[0] : "",
      serviceType: rec.serviceType,
      male: rec.maleCount,
      female: rec.femaleCount,
      children: rec.childrenCount,
      visitors: rec.visitorsCount,
      notes: rec.notes || "",
    });
  };

  const handleEditSave = async () => {
    if (!editRec) return;
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/attendance/${editRec.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditRec(null);
        loadRecords();
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update.");
      }
    } catch {
      setEditError("A network error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const total = (Number(male) || 0) + (Number(female) || 0) + (Number(children) || 0) + (Number(visitors) || 0);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !date) {
      setFeedback({ type: "error", msg: "Please select a service type and date." });
      return;
    }
    if (total === 0) {
      setFeedback({ type: "error", msg: "Total attendance cannot be zero." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          serviceType,
          male: Number(male) || 0,
          female: Number(female) || 0,
          children: Number(children) || 0,
          visitors: Number(visitors) || 0,
          total,
          offertoryAmount: Number(offertory) || 0,
          notes,
        }),
      });

      if (res.ok) {
        setFeedback({ type: "success", msg: "Attendance saved successfully." });
        setMale("");
        setFemale("");
        setChildren("");
        setVisitors("");
        setOffertory("");
        setNotes("");
        loadRecords();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", msg: data.error || "Failed to save attendance." });
      }
    } catch {
      setFeedback({ type: "error", msg: "A network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceLabel = (type: string) => {
    if (type === "sunday_service") return "Sunday Service";
    if (type === "wednesday_class") return "Wednesday Class";
    if (type === "friday_prayers") return "Friday Prayers";
    return type;
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Attendance Tracking
          </h1>
          <p className="text-slate-400 mt-1">Record and view aggregate attendance for church services.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.type === "success" ? <Save className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-white/5 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
          <CalendarDays className="h-5 w-5 text-slate-400" />
          Record New Attendance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="sunday_service">Sunday Service</option>
              <option value="wednesday_class">Wednesday Class</option>
              <option value="friday_prayers">Friday Prayers</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Men</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={male}
              onChange={(e) => setMale(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Women</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={female}
              onChange={(e) => setFemale(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Children</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={children}
              onChange={(e) => setChildren(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Visitors</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={visitors}
              onChange={(e) => setVisitors(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-indigo-300 mb-1.5">Total</label>
            <div className="w-full px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 font-bold flex items-center justify-center">
              {total}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Offertory Amount (GHS) - Optional</label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-slate-500 font-medium">GH₵</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={offertory}
              onChange={(e) => setOffertory(e.target.value ? parseFloat(e.target.value) : "")}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Add any specific observations or notes about this service..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={submitting || total === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {submitting ? "Saving..." : "Save Attendance"}
            <Save className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="bg-slate-800/30 border border-white/5 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            Recent Records
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4 text-center">Men</th>
                  <th className="px-6 py-4 text-center">Women</th>
                  <th className="px-6 py-4 text-center">Children</th>
                  <th className="px-6 py-4 text-center">Visitors</th>
                  <th className="px-6 py-4 text-center text-indigo-400 font-bold">Total</th>
                  <th className="px-6 py-4 text-right">Offertory (GH₵)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(rec.attendanceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                        {getServiceLabel(rec.serviceType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{rec.maleCount}</td>
                    <td className="px-6 py-4 text-center">{rec.femaleCount}</td>
                    <td className="px-6 py-4 text-center">{rec.childrenCount}</td>
                    <td className="px-6 py-4 text-center">{rec.visitorsCount}</td>
                    <td className="px-6 py-4 text-center text-indigo-400 font-bold">{rec.totalCount}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-medium">
                      {Number(rec.offertoryAmount) > 0 ? Number(rec.offertoryAmount).toFixed(2) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(rec)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Attendance</h2>
              <button onClick={() => setEditRec(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{editError}</p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                  <input type="date" max={new Date().toISOString().split("T")[0]} value={editForm.date as string} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Service Type</label>
                  <select value={editForm.serviceType as string} onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="sunday_service">Sunday Service</option>
                    <option value="wednesday_class">Wednesday Class</option>
                    <option value="friday_prayers">Friday Prayers</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Men</label>
                  <input type="number" min="0" value={editForm.male} onChange={(e) => setEditForm({ ...editForm, male: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Women</label>
                  <input type="number" min="0" value={editForm.female} onChange={(e) => setEditForm({ ...editForm, female: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Children</label>
                  <input type="number" min="0" value={editForm.children} onChange={(e) => setEditForm({ ...editForm, children: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Visitors</label>
                  <input type="number" min="0" value={editForm.visitors} onChange={(e) => setEditForm({ ...editForm, visitors: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400">Total: </span>
                <span className="text-indigo-400 font-bold">{editTotal}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button onClick={() => setEditRec(null)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition">
                <Save className="w-3.5 h-3.5" /> {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
