"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, X, Save } from "lucide-react";

interface Event {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  endDate?: string | null;
  location: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, thisWeek: 0, past: 0 });

  // Edit modal state
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);

        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        let upcoming = 0;
        let thisWeek = 0;
        let past = 0;

        data.forEach((evt: Event) => {
          const date = new Date(evt.eventDate);
          if (date < now) {
            past++;
          } else {
            upcoming++;
            if (date <= oneWeekFromNow) {
              thisWeek++;
            }
          }
        });

        setStats({ upcoming, thisWeek, past });
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openEdit = (evt: Event) => {
    setEditError("");
    setEditEvent(evt);
    setEditForm({
      name: evt.name || "",
      eventType: evt.eventType || "",
      eventDate: evt.eventDate ? new Date(evt.eventDate).toISOString().slice(0, 16) : "",
      endDate: evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 16) : "",
      location: evt.location || "",
    });
  };

  const handleEditSave = async () => {
    if (!editEvent) return;
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch(`/api/events/${editEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditEvent(null);
        setLoading(true);
        loadEvents();
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update event.");
      }
    } catch {
      setEditError("A network error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage church events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Upcoming Events", value: stats.upcoming, textClass: "text-indigo-400" },
          { label: "This Week", value: stats.thisWeek, textClass: "text-green-400" },
          { label: "Past Events", value: stats.past, textClass: "text-slate-400" },
        ].map((card) => (
          <div key={card.label} className="bg-slate-800/50 border border-white/5 rounded-xl p-5 text-center">
            <p className="text-slate-400 text-sm mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.textClass}`}>
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Event</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Date</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Type</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Venue</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No events found. Click{" "}
                  <Link href="/admin/events/new" className="text-indigo-400 font-medium hover:underline">
                    New Event
                  </Link>{" "}
                  to create one.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{evt.name}</td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {new Date(evt.eventDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 capitalize">
                    {evt.eventType.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{evt.location ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Event</h2>
              <button onClick={() => setEditEvent(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{editError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Event Name *</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Event Type</label>
                <select value={editForm.eventType} onChange={(e) => setEditForm({ ...editForm, eventType: e.target.value })} className={inputCls}>
                  <option value="sunday_service">Sunday Service</option>
                  <option value="midweek_service">Midweek Service</option>
                  <option value="department_meeting">Department Meeting</option>
                  <option value="special_program">Special Program</option>
                  <option value="outreach">Outreach</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Event Date *</label>
                  <input type="datetime-local" value={editForm.eventDate} onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="datetime-local" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button onClick={() => setEditEvent(null)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">Cancel</button>
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
