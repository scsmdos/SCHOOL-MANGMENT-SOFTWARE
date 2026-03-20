import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet, Banknote, FileText, PieChart, Plus, Search, Download, Printer,
  Edit, Trash2, TrendingUp, TrendingDown, AlertCircle, X, Save, Receipt, RefreshCw, Loader2
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.jpeg';

/* ── Sample Expenses (kept as fallback until backend has expenses endpoint) ── */
const SAMPLE_EXPENSES = [
  { id: 'EXP-9726', title: 'Bijli Bil', payee: 'Guddu Kumar', category: 'MAINTENANCE', amount: '400', date: '2026-03-11', status: 'CLEARED' },
  { id: 'EXP-9727', title: 'Internet Bill', payee: 'Jio Fiber', category: 'UTILITIES', amount: '1,500', date: '2026-03-12', status: 'CLEARED' },
  { id: 'EXP-9728', title: 'Office Supplies', payee: 'Stationary Shop', category: 'OFFICE', amount: '2,300', date: '2026-03-14', status: 'PENDING' },
];

const FinanceFees = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [search, setSearch] = useState('');
  const [feeData, setFeeData] = useState([]);
  const [expenseData, setExpenseData] = useState(SAMPLE_EXPENSES);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      const all = res.data?.data ?? res.data ?? [];
      
      const fees = all.filter(t => t.type !== 'Expense').map(t => ({
        id: t.transaction_id ?? `TXN-${t.id}`,
        rawId: t.id,
        student: t.student_name ?? 'N/A',
        class: t.class_name ?? 'N/A',
        type: t.category ?? 'School Fee',
        method: t.payment_method ? t.payment_method.toUpperCase() : 'CASH',
        amount: String(t.amount || 0),
        date: t.date ? t.date.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : 'N/A'),
        status: t.status ?? 'Paid',
      }));
      
      const exps = all.filter(t => t.type === 'Expense').map(t => ({
        id: t.voucher_id ?? `EXP-${t.id}`,
        rawId: t.id,
        title: t.title ?? 'N/A',
        payee: t.payee_name ?? 'N/A',
        category: t.category ?? 'MISC',
        amount: String(t.amount || 0),
        date: t.date ? t.date.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : 'N/A'),
        status: t.status ?? 'Cleared',
      }));

      setFeeData(fees);
      setExpenseData(exps);
    } catch (err) {
      console.error('Finance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  /* ── Stats Logic ── */
  const totalCollection = feeData.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0'), 0);
  const totalExpenses = expenseData.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/,/g, '') || '0'), 0);
  
  const stats = [
    { label: 'Total Collection', value: `₹${totalCollection.toLocaleString()}`, icon: Wallet, trend: 'CURRENT MONTH', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10 dark:bg-[#10b981]/20' },
    { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString()}`, icon: Banknote, trend: 'CURRENT MONTH', color: 'text-[#f43f5e]', bg: 'bg-[#f43f5e]/10 dark:bg-[#f43f5e]/20' },
    { label: 'Overdue Fees', value: `₹${feeData.filter(f => f.status === 'Pending').reduce((a, f) => a + parseInt(f.amount.replace(/,/g, '') || '0'), 0).toLocaleString()}`, icon: AlertCircle, trend: 'UNPAID', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20' },
    { label: 'Net Profit', value: `₹${(totalCollection - totalExpenses).toLocaleString()}`, icon: PieChart, trend: 'NET BALANCE', color: 'text-[#6366f1]', bg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20' },
  ];

  /* ── CRUD Logic ── */
  const handleDeleteFee = async (rawId, displayId) => {
    if (!window.confirm(`Delete receipt #${displayId || rawId}?`)) return;
    try {
      await api.delete(`/transactions/${rawId}`);
      setFeeData(prev => prev.filter(i => i.rawId !== rawId));
      toast.success('Transaction deleted successfully');
    } catch (err) {
      toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteExp = async (rawId, displayId) => {
    if (!window.confirm(`Delete voucher #${displayId || rawId}?`)) return;
    try {
      await api.delete(`/transactions/${rawId}`);
      setExpenseData(prev => prev.filter(i => i.rawId !== rawId));
      toast.success('Expense deleted successfully');
    } catch (err) {
      toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };
  const handlePrint = (item) => {
    setInvoiceData(item);
  };

  const handleExportCSV = () => {
    const isFees = activeTab === 'fees';
    const data = isFees ? feeData : expenseData;

    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = isFees 
      ? ['Receipt No', 'Student', 'Class', 'Type', 'Method', 'Amount', 'Date', 'Status']
      : ['Voucher ID', 'Title', 'Payee', 'Category', 'Amount', 'Date', 'Status'];

    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const values = isFees 
          ? [row.id, row.student, row.class, row.type, row.method, row.amount, row.date, row.status]
          : [row.id, row.title, row.payee, row.category, row.amount, row.date, row.status];
        return values.map(v => `"${v}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${isFees ? 'fees' : 'expenses'}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${isFees ? 'Fees' : 'Expenses'} Exported successfully!`);
  };

  return (
    <div className="p-6 bg-[var(--bg-main)] min-h-[calc(100vh-56px)] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">Finance & Fees</h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Automated Accounting · Revenue Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 h-9 px-4 rounded-md border border-[var(--border-color)] dark:border-[#334155] bg-white dark:bg-[#10162A] text-[11px] font-extrabold text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#1a2234] transition-colors shadow-sm"
          >
            <Download size={13} strokeWidth={2.5} className="text-[#10b981]" /><span>Export Ledger</span>
          </button>
          <button 
            onClick={() => { setCurrentEdit(null); activeTab === 'fees' ? setIsFeeModalOpen(true) : setIsExpModalOpen(true); }}
            className={`flex items-center justify-center space-x-2 h-9 px-4 rounded-md text-white text-[11px] font-extrabold shadow-sm transition-colors min-w-[130px] ${activeTab === 'fees' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#f43f5e] hover:bg-[#e11d48]'}`}>
            <Plus size={14} strokeWidth={3} />
            <span>{activeTab === 'fees' ? 'Collect Fee' : 'Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 shrink-0">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-lg p-4 flex items-center shadow-sm transition-colors hover:bg-white/5 dark:hover:bg-[#1a2234]">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${s.bg} ${s.color}`}><Icon size={18} strokeWidth={2.5} /></div>
              <div>
                <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">{s.label}</p>
                <p className="text-[20px] font-black text-[var(--text-primary)] leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Panel */}
      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border-color)] dark:border-[#334155] rounded-md flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden transition-colors">
        
        {/* Tab Bar */}
        <div className="flex items-center justify-between px-2 pt-2 border-b border-[var(--border-color)] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] shrink-0">
          <div className="flex space-x-1">
            {[
              { id: 'fees', label: 'FEE COLLECTION', icon: Wallet },
              { id: 'expenses', label: 'EXPENSES & BILLS', icon: FileText },
              { id: 'reports', label: 'FINANCIAL REPORTS', icon: PieChart },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const activeTheme = tab.id === 'fees' ? 'border-[#10b981] text-[#10b981]' : tab.id === 'expenses' ? 'border-[#f43f5e] text-[#f43f5e]' : 'border-[#6366f1] text-[#6366f1]';
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-[10px] font-bold tracking-widest uppercase border-b-[3px] transition-all duration-200 ${isActive ? `${activeTheme} bg-white dark:bg-[#10162a]` : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  <Icon size={13} strokeWidth={isActive ? 3 : 2} /><span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 pb-2 mr-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" strokeWidth={2.5} />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[180px] h-8 pl-8 pr-3 bg-white dark:bg-[#10162A] border border-[var(--border-color)] dark:border-[#334155] rounded text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm" />
            </div>
          </div>
        </div>

        {/* Table/Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeTab === 'fees' && (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">RECEIPT NO</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">STUDENT DETAILS</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">PAYMENT TYPE</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">AMOUNT & DATE</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {feeData.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                    <td className="px-5 py-4"><span className="text-[11px] font-black text-[#10b981]">#{item.id}</span></td>
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-bold text-[var(--text-primary)]">{item.student}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">{item.class}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{item.type}</p>
                      <p className="text-[9px] text-[var(--text-secondary)] font-bold">{item.method}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-black text-[var(--text-primary)]">₹{item.amount}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold">{item.date}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase ${item.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#4ade80] border-green-200 dark:border-green-800' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'}`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => handlePrint(item)} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"><Printer size={12} strokeWidth={2.5} /></button>
                        <button onClick={() => { setCurrentEdit(item); setIsFeeModalOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#10b981] hover:bg-[#10b981] hover:text-white transition-all shadow-sm"><Edit size={12} strokeWidth={2.5} /></button>
                        <button onClick={() => handleDeleteFee(item.rawId, item.id)} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm"><Trash2 size={12} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'expenses' && (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel-alt)] z-10">
                <tr className="border-b border-[var(--border-color)] dark:border-[#334155]">
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">VOUCHER ID</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">EXPENSE DETAIL</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">CATEGORY</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-left">AMOUNT & DATE</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-center">STATUS</th>
                  <th className="px-5 py-3 text-[9px] font-extrabold text-[#94a3b8] tracking-widest uppercase whitespace-nowrap text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-[#151c2e]/50 transition-colors">
                    <td className="px-5 py-4"><span className="text-[11px] font-black text-[#f43f5e]">#{item.id}</span></td>
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-bold text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">Paid to: {item.payee}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-0.5 text-[9px] font-black rounded border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#10162A] text-[var(--text-secondary)] tracking-widest uppercase">{item.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-black text-[var(--text-primary)]">₹{item.amount}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold">{item.date}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black rounded border tracking-widest uppercase ${item.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#4ade80] border-green-200 dark:border-green-800' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'}`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => { setCurrentEdit(item); setIsExpModalOpen(true); }} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#10b981] hover:bg-[#10b981] hover:text-white transition-all shadow-sm"><Edit size={12} strokeWidth={2.5} /></button>
                        <button onClick={() => handleDeleteExp(item.rawId, item.id)} className="w-7 h-7 rounded flex items-center justify-center bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm"><Trash2 size={12} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'reports' && <FinancialReports feeData={feeData} expenseData={expenseData} />}
        </div>
      </div>

      {/* Modals */}
      <FeeModal 
        isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} editData={currentEdit}
        onSave={async (data) => {
          try {
            const payload = {
              type: 'Income',
              category: data.type,
              amount: data.amount,
              student_id: data.student_id, // Link to student ID
              student_name: data.student,
              class_name: data.class,
              payment_method: data.method,
              date: data.date,
              status: 'Completed',
              transaction_id: data.id || `TXN-${Date.now()}`
            };
            if (currentEdit?.rawId) {
              await api.put(`/transactions/${currentEdit.rawId}`, payload);
            } else {
              await api.post('/transactions', payload);
            }
            fetchTransactions();
            toast.success(currentEdit?.rawId ? 'Receipt updated!' : 'Fee collected successfully!');
            setIsFeeModalOpen(false);
          } catch (e) { toast.error('Save failed: ' + e.message); }
        }}
      />
      <ExpenseModal 
        isOpen={isExpModalOpen} onClose={() => setIsExpModalOpen(false)} editData={currentEdit}
        onSave={async (data) => {
          try {
            const vid = data.id || `EXP-${Date.now()}`;
            const payload = {
              type: 'Expense',
              title: data.title,
              category: data.category,
              amount: data.amount,
              payee_name: data.payee,
              date: data.date,
              status: 'Completed', // Enum: ['Completed', 'Pending']
              transaction_id: vid,
              voucher_id: vid
            };
            if (currentEdit?.rawId) {
              await api.put(`/transactions/${currentEdit.rawId}`, payload);
            } else {
              await api.post('/transactions', payload);
            }
            fetchTransactions();
            toast.success(currentEdit?.rawId ? 'Expense updated!' : 'Expense added successfully!');
            setIsExpModalOpen(false);
          } catch (e) { toast.error('Save failed: ' + e.message); }
        }}
      />
      <InvoiceModal data={invoiceData} onClose={() => setInvoiceData(null)} />
    </div>
  );
};

/* ── Financial Reports Sub-Component ── */
const FinancialReports = ({ feeData = [], expenseData = [] }) => {
  const [hoverData, setHoverData] = useState(null);
  
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = d.toLocaleString('default', { month: 'short' });
      const yearMonth = d.toISOString().slice(0, 7); // YYYY-MM
      
      const inc = feeData
        .filter(f => f.date.startsWith(yearMonth))
        .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
      const exp = expenseData
        .filter(e => e.date.startsWith(yearMonth))
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
      months.push({ m: name, inc: inc / 1000, exp: exp / 1000, fullInc: inc, fullExp: exp });
    }
    return months;
  }, [feeData, expenseData]);

  const reports = [
    { title: 'Monthly Profit & Loss', icon: FileText },
    { title: 'Tax & Audit Report 2025-26', icon: FileText },
    { title: 'Defaulters List (Fees)', icon: FileText },
    { title: 'Staff Payroll Sheet (Feb)', icon: FileText },
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.round((x / width) * (chartData.length - 1));
    if (index >= 0 && index < chartData.length) {
      setHoverData({ ...chartData[index], xPos: (index / (chartData.length - 1)) * 100 });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-white text-[14px] font-black uppercase tracking-wider">Revenue vs Expenses</h3>
            <p className="text-slate-400 text-[10px] font-bold">Past 6 Months Overview</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded bg-emerald-500"></div><span className="text-white text-[9px] font-black uppercase tracking-tighter">INCOME</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded bg-rose-500"></div><span className="text-white text-[9px] font-black uppercase tracking-tighter">EXPENSES</span></div>
          </div>
        </div>

        <div className="flex">
          {/* Y-Axis Labels - LEFT SIDE */}
          <div className="flex flex-col justify-between h-[200px] pr-4 text-[9px] font-bold text-slate-500 uppercase pb-1">
            <span>₹800k</span>
            <span>₹600k</span>
            <span>₹400k</span>
            <span>₹200k</span>
            <span>₹0k</span>
          </div>

          <div 
            className="h-[200px] flex-1 relative cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverData(null)}
          >
             {[0, 25, 50, 75, 100].map(p => (
               <div key={p} className="absolute w-full h-[1px] bg-slate-800" style={{ bottom: `${p}%` }}></div>
             ))}
             <svg className="absolute inset-0 w-full h-full overflow-visible">
               <path d="M0,87.5 C100,70 200,75 300,80 C400,70 500,65 600,60 C700,50 800,65 900,87.5 L900,100 L0,100 Z" fill="url(#incomeGradient)" className="opacity-20" transform="scale(1, 2)" />
               <path d="M0,87.5 C100,70 200,75 300,80 C400,70 500,65 600,60 C700,50 800,65 900,87.5" fill="none" stroke="#10b981" strokeWidth="3" transform="scale(1, 2)" />
               <path d="M0,94 C100,92 200,90 300,92 C400,94 500,90 600,88 C700,82 800,94 900,97 L900,100 L0,100 Z" fill="url(#expenseGradient)" className="opacity-20" transform="scale(1, 2)" />
               <path d="M0,94 C100,92 200,90 300,92 C400,94 500,90 600,88 C700,82 800,94 900,97" fill="none" stroke="#f43f5e" strokeWidth="3" transform="scale(1, 2)" />
               <defs>
                 <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                 <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="transparent" /></linearGradient>
               </defs>
             </svg>

             {hoverData && (
               <>
                 <div className="absolute top-0 bottom-0 w-[1px] bg-white opacity-20 z-20 pointer-events-none" style={{ left: `${hoverData.xPos}%` }}></div>
                 <div className="absolute z-30 bg-[#0f172a] border border-slate-700 rounded-lg p-3 shadow-2xl pointer-events-none -translate-x-1/2 min-w-[120px] top-4" style={{ left: `${hoverData.xPos}%` }}>
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-2 text-center border-b border-slate-800 pb-1">{hoverData.m}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-[9px] font-black text-emerald-400">INCOME</span>
                        <span className="text-[11px] font-black text-white">₹{hoverData.fullInc.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-[9px] font-black text-rose-400">EXPENSES</span>
                        <span className="text-[11px] font-black text-white">₹{hoverData.fullExp.toLocaleString()}</span>
                      </div>
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>
        <div className="flex ml-[56px] mt-4 justify-between px-2 text-slate-500">
          {chartData.map(d => <span key={d.m} className="text-[9px] font-bold uppercase">{d.m}</span>)}
        </div>
      </div>
    </div>
  );
};

/* ── MODALS ── */
const inputClass = "w-full h-10 px-3 bg-white dark:bg-[#10162A] border border-gray-200 dark:border-[#334155] rounded-md text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm";

const FeeModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({ student: '', student_id: '', class: 'PLAY', type: 'Tuition Fee', method: 'VIA CASH', amount: '', date: new Date().toISOString().slice(0, 10), status: 'Completed' });
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          ...editData,
          student: editData.student || '',
          student_id: editData.student_id || '',
          class: editData.class || 'PLAY',
          type: editData.type || 'Tuition Fee',
          method: editData.method || 'VIA CASH',
          amount: editData.amount || '',
          date: editData.date || new Date().toISOString().slice(0, 10),
          status: editData.status || 'Completed'
        });
      } else {
        setFormData({ 
          student: '', 
          student_id: '', 
          class: 'PLAY', 
          type: 'Tuition Fee', 
          method: 'VIA CASH', 
          amount: '', 
          date: new Date().toISOString().slice(0, 10), 
          status: 'Completed' 
        });
      }
      // Fetch active students for selection
      api.get('/admissions').then(res => {
        const list = res.data?.data ?? res.data ?? [];
        setStudents(list.filter(s => s.status === 'Approved'));
      }).catch(err => console.error('Error fetching students:', err));
    }
  }, [isOpen, editData]);

  const handleNameChange = (val) => {
    setFormData({ ...formData, student: val, student_id: '' });
    if (val.length > 1) {
      const matches = students.filter(s => 
        s.student_name.toLowerCase().includes(val.toLowerCase()) || 
        (s.admission_no && s.admission_no.toLowerCase().includes(val.toLowerCase()))
      );
      setFilteredStudents(matches.slice(0, 5));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectStudent = (s) => {
    setFormData({
      ...formData,
      student: s.student_name,
      student_id: s.admission_no || s.id,
      class: s.admitted_into_class || 'PLAY'
    });
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[450px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#10b981]"><Wallet size={18} strokeWidth={2.5} /><h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{editData ? 'Edit Receipt' : 'Collect Fee'}</h3></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#0f172a] hover:text-white transition-all"><X size={15} strokeWidth={3} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Student Search (Name or ID)</label>
              <div className="relative">
                <input className={inputClass} placeholder="Type student name..." value={formData.student} onChange={e => handleNameChange(e.target.value)} onFocus={() => formData.student.length > 1 && setShowDropdown(true)} />
                {formData.student_id ? <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div><span className="text-[8px] font-black text-green-500 uppercase">{formData.student_id}</span></div> : null}
              </div>
              
              {showDropdown && filteredStudents.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-lg shadow-xl overflow-hidden">
                  {filteredStudents.map(s => (
                    <button key={s.id} onClick={() => selectStudent(s)} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-[#334155] last:border-0 flex justify-between items-center transition-colors">
                      <div>
                        <p className="text-[11px] font-black text-[var(--text-primary)]">{s.student_name}</p>
                        <p className="text-[9px] font-bold text-[#64748b]">{s.admission_no || `ID: ${s.id}`}</p>
                      </div>
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{s.admitted_into_class}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Class</label>
              <select className={inputClass} value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>
                {['PLAY', 'NURSERY', 'LKG', 'UKG', 'CLASS 1', 'CLASS 2', 'CLASS 3', 'CLASS 4', 'CLASS 5', 'CLASS 6', 'CLASS 7', 'CLASS 8', 'CLASS 9', 'CLASS 10'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Amount (₹)</label><input className={inputClass} type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Payment Type</label><select className={inputClass} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}><option>Tuition Fee</option><option>Admission Fee</option><option>Exam Fee</option><option>Transport</option><option>Other</option></select></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Method</label><select className={inputClass} value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}><option>VIA CASH</option><option>UP/QR</option><option>BANK TRANSFER</option></select></div>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-[#0f172a] rounded">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-6 py-2 bg-[#10b981] text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center"><Save size={14} className="mr-2" />Save</button>
        </div>
      </div>
    </div>
  );
};

const ExpenseModal = ({ isOpen, onClose, onSave, editData }) => {
  const defaultState = { title: '', payee: '', category: 'MAINTENANCE', amount: '', date: new Date().toISOString().slice(0,10), status: 'Completed' };
  const [formData, setFormData] = useState(defaultState);

  React.useEffect(() => { 
    if (isOpen) {
      setFormData(editData ? { ...editData } : defaultState);
    }
  }, [isOpen, editData]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[450px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <div className="flex items-center space-x-3 text-[#f43f5e]"><Banknote size={18} strokeWidth={2.5} /><h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{editData ? 'Edit Expense' : 'Add Expense'}</h3></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#0f172a] hover:text-white transition-all"><X size={15} strokeWidth={3} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Expense Title</label><input className={inputClass} value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
            <div className="col-span-2"><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Payee Name</label><input className={inputClass} value={formData.payee} onChange={e=>setFormData({...formData, payee: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Amount (₹)</label><input className={inputClass} type="number" placeholder="0.00" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Category</label><select className={inputClass} value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}><option value="MAINTENANCE">MAINTENANCE</option><option value="UTILITIES">UTILITIES</option><option value="OFFICE">OFFICE</option><option value="SALARY">SALARY</option><option value="TRANSPORT">TRANSPORT</option><option value="OTHER">OTHER</option></select></div>
            <div className="col-span-2"><label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1 block">Expense Date</label><input type="date" className={inputClass} value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} /></div>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1a2234]">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-[#0f172a] rounded">Cancel</button>
          <button onClick={()=>onSave(formData)} className="px-6 py-2 bg-[#f43f5e] text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center"><Save size={14} className="mr-2" />Save</button>
        </div>
      </div>
    </div>
  );
};

const InvoiceModal = ({ data, onClose }) => {
  const [studentInfo, setStudentInfo] = useState({ father: '', roll: '' });

  useEffect(() => {
    if (data && data.student) {
      api.get('/admissions').then(res => {
        const all = res.data?.data ?? res.data ?? [];
        const match = all.find(s => s.student_name === data.student && s.admitted_into_class === data.class);
        if (match) {
          setStudentInfo({ father: match.father_name || 'N/A', roll: match.roll_no || 'N/A' });
        }
      }).catch(err => console.log(err));
    }
  }, [data]);

  if (!data) return null;

  const handleNativePrint = () => {
    const printElement = document.getElementById('print-invoice-area');
    const originalContent = document.body.innerHTML;

    // Wrap the print content in a centered container with outerHTML so container styles are preserved
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; width: 100%; padding: 20px; background-color: #ffffff !important;">
        ${printElement.outerHTML}
      </div>
    `;

    // Small delay ensures the DOM is fully rendered before print dialog appears
    setTimeout(() => {
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore React bindings
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[700px] bg-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-indigo-900 flex items-center"><Printer size={18} className="mr-2 text-indigo-600" /> Print Receipt</h3>
          <div className="flex space-x-2">
            <button onClick={handleNativePrint} className="px-6 py-2 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest shadow flex items-center"><Printer size={14} className="mr-2" /> Print</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={15} strokeWidth={3} /></button>
          </div>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-200 flex justify-center items-start">
          {/* Printable Area - styled explicitly with standard CSS for printing */}
          <div id="print-invoice-area" className="bg-white w-full max-w-[600px] shadow-sm relative p-5 md:p-6" style={{ backgroundColor: '#ffffff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
             {/* School Header */}
             <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>
                <img src={logoImg} alt="School Logo" style={{ height: '55px', margin: '0 auto 6px auto', display: 'block' }} />
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '1px' }}>LITTLE SEEDS SCHOOL</h1>
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Affiliated to CBSE, New Delhi</p>
             </div>

             {/* Receipt Title */}
             <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#eef2ff', color: '#3730a3', padding: '3px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #c7d2fe' }}>
                  FEE RECEIPT
                </span>
             </div>

             {/* Meta Info */}
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
                <div>
                   <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#64748b' }}>Receipt No:</strong> <span style={{ fontWeight: 'bold' }}>{data.id}</span></p>
                   <p style={{ margin: 0 }}><strong style={{ color: '#64748b' }}>Date:</strong> <span style={{ fontWeight: 'bold' }}>{data.date}</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#64748b' }}>Academic Year:</strong> <span style={{ fontWeight: 'bold' }}>2025-26</span></p>
                   <p style={{ margin: 0 }}><strong style={{ color: '#64748b' }}>Payment Mode:</strong> <span style={{ fontWeight: 'bold' }}>{data.method}</span></p>
                </div>
             </div>

             {/* Student Details - 2 Columns */}
             <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
               <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>Student Details</h4>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                 <div style={{ flex: 1, paddingRight: '10px' }}>
                    <p style={{ margin: '0 0 4px 0' }}><span style={{ color: '#64748b', display: 'inline-block', width: '90px' }}>Student Name:</span> <strong style={{ color: '#0f172a' }}>{data.student}</strong></p>
                    <p style={{ margin: 0 }}><span style={{ color: '#64748b', display: 'inline-block', width: '90px' }}>Class & Sec:</span> <strong style={{ color: '#0f172a' }}>{data.class}</strong></p>
                 </div>
                 <div style={{ flex: 1, paddingLeft: '10px', borderLeft: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 4px 0' }}><span style={{ color: '#64748b', display: 'inline-block', width: '90px' }}>Father's Name:</span> <strong style={{ color: '#0f172a' }}>{studentInfo.father || 'N/A'}</strong></p>
                    <p style={{ margin: 0 }}><span style={{ color: '#64748b', display: 'inline-block', width: '90px' }}>Roll No:</span> <strong style={{ color: '#0f172a' }}>{studentInfo.roll || 'N/A'}</strong></p>
                 </div>
               </div>
             </div>

             {/* Fee Particulars */}
             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                   <tr>
                     <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #cbd5e1', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1' }}>Particulars</th>
                     <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #cbd5e1', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1' }}>Amount (INR)</th>
                   </tr>
                </thead>
                <tbody>
                   <tr>
                     <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}>{data.type}</td>
                     <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{data.amount}</td>
                   </tr>
                </tbody>
                <tfoot>
                   <tr>
                     <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569' }}>Total Amount Paid</td>
                     <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '15px', fontWeight: '900', color: '#166534', backgroundColor: '#f0fdf4', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>₹{data.amount}</td>
                   </tr>
                </tfoot>
             </table>

             {/* Signatures */}
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', marginBottom: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '130px', borderTop: '1px solid #94a3b8', paddingTop: '4px', fontSize: '10px', color: '#475569' }}>Cashier / Clerk</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '130px', borderTop: '1px solid #94a3b8', paddingTop: '4px', fontSize: '10px', color: '#475569' }}>Authorized Signatory</div>
                </div>
             </div>

             {/* Footer Tagline */}
             <div style={{ textAlign: 'center', fontSize: '9px', color: '#94a3b8', fontStyle: 'italic', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                This is a computer generated receipt and does not require a physical signature.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceFees;
