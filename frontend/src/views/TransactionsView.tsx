import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  TransactionType,
  ExpenseCategory,
  PaymentMethod,
} from '../types';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Download,
  Trash2,
  Tag,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    currency,
    setIsQuickAddOpen,
    categories,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesType = selectedType === 'all' || t.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesMethod = selectedMethod === 'all' || t.paymentMethod === selectedMethod;

      return matchesSearch && matchesType && matchesCategory && matchesMethod;
    });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedMethod]);

  const exportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'PaymentMethod', 'Notes', 'Tags'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join(';')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finova_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Finova Ledger
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Transactions & History
          </h1>
          <p className="text-xs text-zinc-400">
            Search, filter, categorize, and export your entire income and expense record.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161922] hover:bg-[#1f2937] text-zinc-200 text-xs font-semibold rounded-xl border border-[#1f2937] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, tag, or note..."
              className="w-full bg-[#161922] text-zinc-200 text-xs pl-9 pr-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Types (Expense / Income / Investment)</option>
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
            <option value="investment">Investments Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="UPI">UPI Apps (GPay, PhonePe, Paytm)</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="PayPal">PayPal</option>
            <option value="Cash">Cash / Wallet</option>
          </select>
        </div>

        {/* Count summary */}
        <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1f2937]">
          <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
          {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || selectedMethod !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedMethod('all');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl overflow-hidden shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300">No transactions found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters, or add a new transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f2937] bg-[#161922] text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/70 text-xs">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isInv = tx.type === 'investment';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#161922]/60 transition-colors group"
                    >
                      {/* Title & Notes & Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isInv
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : isInv ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-100 flex items-center gap-2">
                              <span>{tx.title}</span>
                              {tx.isRecurring && (
                                <span className="text-[9px] bg-[#161922] text-zinc-400 border border-[#1f2937] px-1.5 py-0.2 rounded font-normal">
                                  Recurring
                                </span>
                              )}
                            </div>
                            {tx.notes && (
                              <div className="text-[11px] text-zinc-400 line-clamp-1">
                                {tx.notes}
                              </div>
                            )}
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tx.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] bg-[#161922] text-zinc-300 border border-[#1f2937] px-1.5 py-0.2 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-[#161922] border border-[#1f2937] text-zinc-300 px-2 py-0.5 rounded text-[11px] font-medium">
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Method & Provider */}
                      <td className="py-3.5 px-4 text-zinc-300">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-zinc-200">
                            {tx.paymentMethod}
                          </span>
                          {tx.paymentProvider && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {tx.paymentProvider}
                            </span>
                          )}
                          {tx.referenceId && (
                            <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[120px]">
                              {tx.referenceId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                          isIncome
                            ? 'text-emerald-400'
                            : isInv
                            ? 'text-amber-300'
                            : 'text-zinc-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-[#1f2937] transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
