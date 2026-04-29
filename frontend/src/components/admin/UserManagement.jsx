import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Pagination from '../common/Pagination';
import Loader from '../common/Loader';

const ROLES = ['customer', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // userId being acted on
  const [feedback, setFeedback] = useState(null); // {type: 'success'|'error', message}
  const feedbackTimer = useRef(null);

  useEffect(() => { fetchUsers(); }, [page, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type, message) {
    setFeedback({ type, message });
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }

  async function handleRoleChange(userId, newRole) {
    setActionLoading(userId + '_role');
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showFeedback('success', 'Role updated successfully.');
      fetchUsers();
    } catch (err) {
      showFeedback('error', err.response?.data?.error?.message || 'Failed to update role.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivate(userId, userName) {
    if (!window.confirm(`Deactivate "${userName}"? They will no longer be able to log in.`)) return;
    setActionLoading(userId + '_status');
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      showFeedback('success', `"${userName}" has been deactivated.`);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.message
        || err.response?.data?.message
        || `Error ${err.response?.status || ''}: Failed to deactivate user.`;
      showFeedback('error', msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate(userId, userName) {
    if (!window.confirm(`Reactivate "${userName}"? They will be able to log in again.`)) return;
    setActionLoading(userId + '_status');
    try {
      await api.put(`/admin/users/${userId}/reactivate`);
      showFeedback('success', `"${userName}" has been reactivated.`);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.message
        || err.response?.data?.message
        || `Error ${err.response?.status || ''}: Failed to reactivate user.`;
      showFeedback('error', msg);
    } finally {
      setActionLoading(null);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Users</h2>
          {!loading && <p className="text-sm text-slate-400 mt-0.5">{total} total users</p>}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`} role="alert">
          {feedback.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {feedback.message}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            className="btn-secondary px-4"
          >
            Clear
          </button>
        )}
      </form>

      {loading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => {
                const isRoleLoading = actionLoading === user._id + '_role';
                const isStatusLoading = actionLoading === user._id + '_status';

                return (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-indigo-700">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role selector */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          disabled={isRoleLoading}
                          className={`text-xs font-semibold border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 ${
                            user.role === 'admin'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                          aria-label={`Role for ${user.name}`}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                        {isRoleLoading && (
                          <svg className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      <span className={`badge ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td className="px-5 py-4 text-xs text-slate-400 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {isStatusLoading ? (
                        <svg className="w-4 h-4 animate-spin text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : user.isActive ? (
                        <button
                          onClick={() => handleDeactivate(user._id, user.name)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(user._id, user.name)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!users.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
