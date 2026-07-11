"use client";

import { useState, useRef, useCallback } from "react";

interface EventOption {
  id: string;
  name: string;
  branchId: string;
  eventDate: string;
}

interface ParsedRow {
  memberId: string;
  present: boolean;
  notes: string;
}

export default function AttendancePage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [serviceType, setServiceType] = useState("sunday_service");
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch events on mount
  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        const unique = Array.from(new Map(data.map((e: any) => [e.name, e])).values()) as EventOption[];
        setEvents(unique);
        setEventsLoaded(true);
      }
    } catch {
      /* silent */
    }
  }, []);

  // Load events on first render
  useState(() => {
    loadEvents();
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // Skip header row if it looks like one
      const startIdx =
        lines[0]?.toLowerCase().includes("member_id") ||
        lines[0]?.toLowerCase().includes("memberid")
          ? 1
          : 0;

      const parsed: ParsedRow[] = [];
      const errors: string[] = [];

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 2) {
          errors.push(`Row ${i + 1}: expected at least 2 columns (member_id, present)`);
          continue;
        }

        const memberId = cols[0];
        const presentRaw = cols[1]?.toLowerCase();
        const present =
          presentRaw === "true" ||
          presentRaw === "1" ||
          presentRaw === "yes" ||
          presentRaw === "y";
        const notes = cols[2] ?? "";

        if (!memberId) {
          errors.push(`Row ${i + 1}: member_id is empty`);
          continue;
        }

        parsed.push({ memberId, present, notes });
      }

      if (errors.length > 0) {
        setFeedback({
          type: "error",
          msg: `Parsed ${parsed.length} rows with ${errors.length} errors:\n${errors.slice(0, 5).join("\n")}`,
        });
      } else {
        setFeedback({
          type: "success",
          msg: `Successfully parsed ${parsed.length} attendance records from CSV. Click "Submit" to save.`,
        });
      }

      setCsvRows(parsed);
    };
    reader.readAsText(file);

    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedEvent) {
      setFeedback({ type: "error", msg: "Please select an event first." });
      return;
    }
    if (csvRows.length === 0) {
      setFeedback({ type: "error", msg: "No records to submit. Upload a CSV file first." });
      return;
    }

    const evt = events.find((e) => e.id === selectedEvent);
    if (!evt) return;

    setUploading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent,
          branchId: evt.branchId,
          records: csvRows.map((r) => ({
            memberId: r.memberId,
            isPresent: r.present,
            notes: r.notes || undefined,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback({
          type: "success",
          msg: `Successfully recorded ${data.inserted} attendance entries.`,
        });
        setCsvRows([]);
      } else {
        const data = await res.json();
        setFeedback({ type: "error", msg: data.error || "Failed to submit attendance." });
      }
    } catch {
      setFeedback({ type: "error", msg: "A network error occurred." });
    } finally {
      setUploading(false);
    }
  };

  const clearCsv = () => {
    setCsvRows([]);
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Record and track event attendance</p>
        </div>
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            id="bulk-upload-btn"
            onClick={handleFileSelect}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            CSV Upload
          </button>
          <button
            id="record-attendance-btn"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Record Attendance
          </button>
        </div>
      </div>

      {/* Feedback alert */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm whitespace-pre-line ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Event selector */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Event</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose an event…</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name} — {new Date(evt.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="sunday_service">Sunday Service</option>
            <option value="midweek">Midweek</option>
            <option value="special_event">Special Event</option>
          </select>
        </div>
      </div>

      {/* CSV Preview Table */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-white font-medium text-sm">
            {csvRows.length > 0
              ? `Parsed Attendance — ${csvRows.length} records`
              : "Member Attendance List"}
          </span>
          {csvRows.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={clearCsv}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || !selectedEvent}
                className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {uploading ? "Submitting…" : "Submit Attendance"}
              </button>
            </div>
          )}
        </div>

        {csvRows.length > 0 ? (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 sticky top-0">
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Member ID</th>
                  <th className="px-4 py-3 font-medium">Present</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {csvRows.map((row, idx) => (
                  <tr key={idx} className="text-slate-300 hover:bg-white/[.02]">
                    <td className="px-4 py-2.5 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.memberId}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.present
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {row.present ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-slate-500 text-sm">
            Upload a CSV file to preview attendance records before submitting.
            <br />
            CSV format:{" "}
            <code className="text-indigo-400">member_id, present (true/false), notes</code>
          </div>
        )}
      </div>
    </div>
  );
}
