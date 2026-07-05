"use client";

import { useState, useEffect, useRef } from "react";

interface Notification { id: string; title: string; message: string; createdAt: string; isRead: boolean; }

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifs() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) { const data = await res.json(); setNotifs(data); }
    } catch {}
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {notifs.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {notifs.length > 9 ? "9+" : notifs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Notifications</span>
            {notifs.length > 0 && (
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{notifs.length} unread</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">No new notifications</div>
            ) : notifs.map(n => (
              <div key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{n.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-slate-600 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => markRead(n.id)} className="flex-shrink-0 text-slate-500 hover:text-indigo-400 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
