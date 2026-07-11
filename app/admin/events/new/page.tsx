"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branchId, setBranchId] = useState("");

  // Fetch the default branch on mount
  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranchId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const eventDate = form.get("eventDate") as string;
    const endDate = form.get("endDate") as string;
    const expectedAttendance = form.get("expectedAttendance") as string;

    const body: Record<string, unknown> = {
      branchId,
      name: form.get("name"),
      eventType: form.get("eventType"),
      description: form.get("description") || undefined,
      eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      location: form.get("location") || undefined,
      expectedAttendance: expectedAttendance
        ? parseInt(expectedAttendance)
        : undefined,
    };

    // Remove undefined values
    Object.keys(body).forEach((k) => {
      if (body[k] === undefined || body[k] === "") delete body[k];
    });

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create event");
        setLoading(false);
        return;
      }

      router.push("/admin/events");
    } catch {
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Event</h1>
        <p className="text-slate-400 text-sm mt-1">
          Schedule a new church event or service
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5"
      >
        {/* Event Name */}
        <div>
          <label className={labelCls}>Event Name *</label>
          <input
            name="name"
            required
            className={inputCls}
            placeholder="Sunday Worship Service"
          />
        </div>

        {/* Type + Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Event Type *</label>
            <select name="eventType" required className={inputCls}>
              <option value="">Select type…</option>
              <option value="sunday_service">Sunday Service</option>
              <option value="midweek_service">Midweek Service</option>
              <option value="department_meeting">Department Meeting</option>
              <option value="special_program">Special Program</option>
              <option value="outreach">Outreach</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Event Date *</label>
            <input name="eventDate" type="datetime-local" required className={inputCls} />
          </div>
        </div>

        {/* End Date + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>End Date</label>
            <input name="endDate" type="datetime-local" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input
              name="location"
              className={inputCls}
              placeholder="Church Auditorium"
            />
          </div>
        </div>

        {/* Expected Attendance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Expected Attendance</label>
            <input
              name="expectedAttendance"
              type="number"
              min="1"
              className={inputCls}
              placeholder="100"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            rows={3}
            className={inputCls}
            placeholder="Brief description of the event…"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !branchId}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Saving…" : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
