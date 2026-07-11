"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  location: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, thisWeek: 0, past: 0 });

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);

          // Calculate stats
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
    }

    loadEvents();
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
