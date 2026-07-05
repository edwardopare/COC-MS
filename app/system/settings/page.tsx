import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global platform settings</p>
      </div>

      <div className="space-y-4">
        {[
          { key: "budget_alert_threshold", label: "Budget Alert Threshold", desc: "Send alert when budget usage reaches this % (e.g. 0.8 = 80%)", type: "number", placeholder: "0.8" },
          { key: "financial_year_start", label: "Financial Year Start Month", desc: "Month number when the financial year begins (1–12)", type: "number", placeholder: "1" },
          { key: "member_id_prefix", label: "Member ID Prefix", desc: "Prefix used when generating member IDs", type: "text", placeholder: "CHU" },
        ].map(setting => (
          <div key={setting.key} className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
            <label className="block text-white text-sm font-semibold mb-1">{setting.label}</label>
            <p className="text-slate-400 text-xs mb-3">{setting.desc}</p>
            <div className="flex gap-3">
              <input type={setting.type} placeholder={setting.placeholder}
                className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition">Save</button>
            </div>
          </div>
        ))}

        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-1">Locked Financial Periods</h2>
          <p className="text-slate-400 text-xs mb-3">Lock a YYYY-MM period to prevent retrospective changes.</p>
          <div className="flex gap-3">
            <input type="month" className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition">Lock Period</button>
          </div>
        </div>
      </div>
    </div>
  );
}
