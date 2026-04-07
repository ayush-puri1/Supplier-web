'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filterAction) params.append('action', filterAction);
      if (filterEntity) params.append('entityType', filterEntity);
      const data: any = await fetchWithAuth(`/admin/audit-logs?${params}`);
      setLogs(data?.logs || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchWithAuth('/admin/audit-logs/actions').then((d: any) => setActions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { loadLogs(); }, [page, filterAction, filterEntity]);

  const selectCls = "px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm bg-white focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none transition-all";

  return (
    <DashboardLayout title="Audit Logs">
      <div className="space-y-6 animate-fade-in-up">
        <div><h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Audit Logs</h1><p className="text-sm text-[#6B7280]">Detailed historical record of all critical platform events.</p></div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-wrap gap-4 items-center">
          <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">All Entities</option>
            {['User', 'Supplier', 'Product', 'System'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="flex-1" />
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total: {total} records</p>
        </div>

        {loading ? <div className="text-center py-20"><LoadingSpinner /></div> : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead><tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]"><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Actor</th><th className="px-6 py-4">Entity</th><th className="px-6 py-4">Details</th></tr></thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#ECFDF5]/20 transition-colors">
                      <td className="px-6 py-4 text-xs text-[#6B7280] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-2.5 py-1 rounded-md bg-[#F9FAFB] text-[10px] font-bold uppercase tracking-wider text-[#374151] border border-[#E5E7EB]">{log.action}</span></td>
                      <td className="px-6 py-4"><p className="text-xs font-semibold">{log.actorEmail}</p><p className="text-[10px] text-[#9CA3AF] font-mono">{log.actorId?.slice(0, 8)}...</p></td>
                      <td className="px-6 py-4"><p className="text-xs font-semibold">{log.entityType}</p><p className="text-[10px] text-[#9CA3AF] font-mono">{log.entityId?.slice(0, 8)}...</p></td>
                      <td className="px-6 py-4 text-xs text-[#6B7280] max-w-xs truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#9CA3AF] italic">No audit logs found.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-4 p-4 border-t border-[#E5E7EB]">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold text-[#374151]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
