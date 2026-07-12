"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, X, Save } from "lucide-react";

interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string | null;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  address?: string;
  occupation?: string;
  joinDate?: string;
  isBaptized?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  memberStatus: "active" | "inactive" | "transferred" | "deceased";
  createdAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        status: status,
        page: String(page),
        limit: "10",
      });
      const res = await fetch(`/api/members?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data);
        setTotalPages(data.pages);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const openEdit = async (member: Member) => {
    setEditError("");
    // Fetch full member data
    try {
      const res = await fetch(`/api/members/${member.id}`);
      if (res.ok) {
        const full = await res.json();
        setEditMember(full);
        setEditForm({
          firstName: full.firstName || "",
          middleName: full.middleName || "",
          lastName: full.lastName || "",
          phone: full.phone || "",
          email: full.email || "",
          gender: full.gender || "",
          dateOfBirth: full.dateOfBirth ? full.dateOfBirth.split("T")[0] : "",
          maritalStatus: full.maritalStatus || "",
          address: full.address || "",
          occupation: full.occupation || "",
          joinDate: full.joinDate ? full.joinDate.split("T")[0] : "",
          isBaptized: full.isBaptized || false,
          emergencyContactName: full.emergencyContactName || "",
          emergencyContactPhone: full.emergencyContactPhone || "",
        });
      }
    } catch {
      /* silent */
    }
  };

  const handleEditSave = async () => {
    if (!editMember) return;
    setEditLoading(true);
    setEditError("");

    // Strip empty strings
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(editForm)) {
      if (value !== "") body[key] = value;
    }

    try {
      const res = await fetch(`/api/members/${editMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditMember(null);
        fetchMembers();
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update member.");
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
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-slate-400 text-sm mt-1">Search and manage church members</p>
        </div>
        <Link
          href="/admin/members/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or member ID…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Member ID</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Name</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Phone</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Joined</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading members...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No members found. Click{" "}
                  <Link href="/admin/members/new" className="text-indigo-400 font-medium hover:underline">
                    Add Member
                  </Link>{" "}
                  to register your first member.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 font-mono text-xs text-indigo-400 font-semibold">
                    {member.memberId}
                  </td>
                  <td className="px-4 py-3.5 text-white font-medium">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{member.phone}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border capitalize ${
                        member.memberStatus === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : member.memberStatus === "inactive"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {member.memberStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(member)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-slate-900/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition font-medium"
            >
              Previous
            </button>
            <span className="text-slate-400 text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Member</h2>
              <button onClick={() => setEditMember(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{editError}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name *</label>
                <input value={editForm.firstName as string} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name *</label>
                <input value={editForm.lastName as string} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Middle Name</label>
                <input value={editForm.middleName as string} onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input value={editForm.phone as string} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Email</label>
                <input type="email" value={editForm.email as string} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={editForm.gender as string} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className={inputCls}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" max={new Date().toISOString().split("T")[0]} value={editForm.dateOfBirth as string} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Marital Status</label>
                <select value={editForm.maritalStatus as string} onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })} className={inputCls}>
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Occupation</label>
                <input value={editForm.occupation as string} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Address</label>
                <input value={editForm.address as string} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Join Date</label>
                <input type="date" max={new Date().toISOString().split("T")[0]} value={editForm.joinDate as string} onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })} className={inputCls} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" checked={editForm.isBaptized as boolean} onChange={(e) => setEditForm({ ...editForm, isBaptized: e.target.checked })} className="w-4 h-4 rounded border-white/20 text-indigo-500" />
                <label className="text-sm text-slate-300">Baptized</label>
              </div>
              <div>
                <label className={labelCls}>Emergency Contact Name</label>
                <input value={editForm.emergencyContactName as string} onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Emergency Contact Phone</label>
                <input value={editForm.emergencyContactPhone as string} onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button onClick={() => setEditMember(null)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">Cancel</button>
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
