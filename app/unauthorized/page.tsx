import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="text-6xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-2xl font-semibold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">
          You don&apos;t have permission to view this page.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
