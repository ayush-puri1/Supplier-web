'use client';

import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');

    const loadFilters = async () => {
        try {
            const res = await fetchWithAuth('/admin/audit-logs/actions');
            setActions(res);
        } catch (err) {
            console.error('Failed to load actions', err);
        }
    };

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page: page.toString() });
            if (filterAction) query.append('action', filterAction);
            if (filterEntity) query.append('entityType', filterEntity);

            const data = await fetchWithAuth(`/admin/audit-logs?${query.toString()}`);
            setLogs(data.logs);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filterAction, filterEntity]);

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
                <p className="text-muted-foreground">Detailed historical record of all critical platform events.</p>
            </div>

            {/* Filters */}
            <div className="glass p-4 rounded-2xl border border-border flex flex-wrap gap-4">
                <select
                    value={filterAction}
                    onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                    className="p-2 rounded-xl bg-background border border-border text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                    <option value="">All Actions</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                <select
                    value={filterEntity}
                    onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
                    className="p-2 rounded-xl bg-background border border-border text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                    <option value="">All Entities</option>
                    <option value="User">User</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Product">Product</option>
                    <option value="System">System</option>
                </select>

                <div className="ml-auto text-xs text-muted-foreground self-center font-bold">
                    Total Records: {total}
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/50 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Actor</th>
                            <th className="px-6 py-4">Entity</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground opacity-50">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No logs found matching criteria.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-primary/5 transition-colors text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-xs uppercase bg-secondary/50 px-2 py-1 rounded-md border border-border">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{log.actorEmail || 'System'}</p>
                                        <p className="text-[10px] text-muted-foreground tracking-tighter">{log.actorId}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium">{log.entityType}</p>
                                        <p className="text-[10px] text-muted-foreground tracking-tighter">{log.entityId}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        {log.details || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl bg-secondary text-sm font-bold hover:bg-primary/20 disabled:opacity-30 transition-all"
                    >
                        ← Prev
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl bg-secondary text-sm font-bold hover:bg-primary/20 disabled:opacity-30 transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
