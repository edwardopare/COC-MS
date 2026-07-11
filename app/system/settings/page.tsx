"use client";

import { useState, useEffect } from "react";

interface Setting {
  key: string;
  value: string;
  description: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Period lock field state
  const [lockPeriodVal, setLockPeriodVal] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data: Setting[] = await res.json();
        const kv: Record<string, string> = {};
        const descMap: Record<string, string> = {};
        data.forEach((s) => {
          kv[s.key] = s.value;
          descMap[s.key] = s.description ?? "";
        });
        setSettings(kv);
        setDescriptions(descMap);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        setFeedback({ type: "success", msg: `Setting "${key}" updated successfully!` });
        loadSettings();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", msg: data.error ?? "Failed to save setting." });
      }
    } catch {
      setFeedback({ type: "error", msg: "A network error occurred." });
    } finally {
      setSavingKey(null);
    }
  };

  const handleLockPeriod = async () => {
    if (!lockPeriodVal) return;
    setFeedback(null);

    // Locked periods is stored as a JSON array string e.g. ["2026-06", "2026-07"]
    let currentLocked: string[] = [];
    try {
      currentLocked = JSON.parse(settings.locked_periods ?? "[]");
    } catch {
      currentLocked = [];
    }

    if (currentLocked.includes(lockPeriodVal)) {
      setFeedback({ type: "error", msg: `Period ${lockPeriodVal} is already locked.` });
      return;
    }

    const newLocked = [...currentLocked, lockPeriodVal];
    await handleSave("locked_periods", JSON.stringify(newLocked));
    setLockPeriodVal("");
  };

  const handleUnlockPeriod = async (period: string) => {
    setFeedback(null);
    let currentLocked: string[] = [];
    try {
      currentLocked = JSON.parse(settings.locked_periods ?? "[]");
    } catch {
      currentLocked = [];
    }

    const newLocked = currentLocked.filter((p) => p !== period);
    await handleSave("locked_periods", JSON.stringify(newLocked));
  };

  const lockedPeriodsList: string[] = (() => {
    try {
      return JSON.parse(settings.locked_periods ?? "[]");
    } catch {
      return [];
    }
  })();

  const settingDefinitions = [
    {
      key: "budget_alert_threshold",
      label: "Budget Alert Threshold",
      desc: "Send alert when budget usage reaches this % (e.g. 0.8 = 80%)",
      type: "number",
      step: "0.1",
      min: "0.1",
      max: "1.0",
    },
    {
      key: "financial_year_start",
      label: "Financial Year Start Month",
      desc: "Month number when the financial year begins (01–12)",
      type: "number",
      min: "1",
      max: "12",
    },
    {
      key: "member_id_prefix",
      label: "Member ID Prefix",
      desc: "Prefix used when generating member IDs",
      type: "text",
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global platform settings</p>
      </div>

      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Loading settings…</div>
      ) : (
        <div className="space-y-4">
          {settingDefinitions.map((defn) => (
            <div key={defn.key} className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
              <label className="block text-white text-sm font-semibold mb-1">{defn.label}</label>
              <p className="text-slate-400 text-xs mb-3">
                {descriptions[defn.key] || defn.desc}
              </p>
              <div className="flex gap-3">
                <input
                  type={defn.type}
                  step={defn.step}
                  min={defn.min}
                  max={defn.max}
                  value={settings[defn.key] ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, [defn.key]: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleSave(defn.key, settings[defn.key])}
                  disabled={savingKey === defn.key}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {savingKey === defn.key ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ))}

          {/* Locked Financial Periods section */}
          <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-1">Locked Financial Periods</h2>
            <p className="text-slate-400 text-xs mb-3">Lock a YYYY-MM period to prevent retrospective changes.</p>
            <div className="flex gap-3 mb-4">
              <input
                type="month"
                value={lockPeriodVal}
                onChange={(e) => setLockPeriodVal(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleLockPeriod}
                disabled={savingKey === "locked_periods" || !lockPeriodVal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {savingKey === "locked_periods" ? "Locking…" : "Lock Period"}
              </button>
            </div>

            {/* List of currently locked periods */}
            {lockedPeriodsList.length > 0 ? (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <p className="text-slate-300 text-xs font-semibold">Currently Locked Periods:</p>
                <div className="flex flex-wrap gap-2">
                  {lockedPeriodsList.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono"
                    >
                      {p}
                      <button
                        onClick={() => handleUnlockPeriod(p)}
                        className="text-red-400 hover:text-red-200 focus:outline-none"
                        title="Unlock period"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No periods are currently locked.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
