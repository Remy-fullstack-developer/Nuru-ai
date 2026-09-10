import React, { useState } from 'react';
import { Language, MobileTransaction, CommunityReference, WorkerProfile, CreditAssessment } from '../types';
import { UI_TRANSLATIONS } from '../data/knowledge';
import { calculateCreditScore } from '../utils/creditCalculator';
import { ShieldCheck, TrendingUp, Plus, Download, CheckCircle, Smartphone, Users, Zap, Award, FileText, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';

interface CreditAssessmentTabProps {
  language: Language;
  isDarkMode: boolean;
  worker: WorkerProfile;
  transactions: MobileTransaction[];
  onAddTransaction: (tx: MobileTransaction) => void;
  references: CommunityReference[];
  onAddReference: (ref: CommunityReference) => void;
  onOpenPassport: () => void;
}

export const CreditAssessmentTab: React.FC<CreditAssessmentTabProps> = ({
  language,
  isDarkMode,
  worker,
  transactions,
  onAddTransaction,
  references,
  onAddReference,
  onOpenPassport,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;

  const [activeSubTab, setActiveSubTab] = useState<'score' | 'momo' | 'guarantors'>('score');

  // Form states for adding transaction
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'payment' | 'utility' | 'airtime'>('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCounterparty, setTxCounterparty] = useState('');
  const [txRef, setTxRef] = useState('');

  // Form states for adding guarantor
  const [showRefModal, setShowRefModal] = useState(false);
  const [refName, setRefName] = useState('');
  const [refRole, setRefRole] = useState<'cooperative_leader' | 'local_elder' | 'market_chair' | 'fellow_trader' | 'landlord'>('cooperative_leader');
  const [refPhone, setRefPhone] = useState('');
  const [refMonths, setRefMonths] = useState('12');
  const [refAmount, setRefAmount] = useState('50000');

  // Compute live assessment score
  const assessment: CreditAssessment = calculateCreditScore(transactions, references, worker);

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txCounterparty) return;

    const newTx: MobileTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: txType,
      amount: parseFloat(txAmount),
      currency: worker.currency || 'RWF',
      counterparty: txCounterparty,
      status: 'completed',
      reference: txRef || `MoMo-TX-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onAddTransaction(newTx);
    setShowTxModal(false);
    setTxAmount('');
    setTxCounterparty('');
    setTxRef('');
  };

  const handleCreateRef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName || !refPhone) return;

    const newRef: CommunityReference = {
      id: `ref-${Date.now()}`,
      name: refName,
      role: refRole,
      phone: refPhone,
      relationshipMonths: parseInt(refMonths) || 12,
      vouchAmount: parseFloat(refAmount) || 50000,
      trustRating: 5,
      verificationStatus: 'verified',
      notes: 'Community peer reference submitted via KoraTrust network.',
    };

    onAddReference(newRef);
    setShowRefModal(false);
    setRefName('');
    setRefPhone('');
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 680) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    if (score >= 580) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    return 'text-slate-500 border-slate-500/30 bg-slate-500/10';
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 space-y-6">
      {/* Worker Quick Header */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow shrink-0">
            {worker.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{worker.name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {worker.occupation}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {worker.location} • {worker.phone} • {worker.cooperativeName}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPassport}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow flex items-center gap-2 transition-all w-full md:w-auto justify-center"
        >
          <FileText className="w-4 h-4" />
          <span>{t.downloadPassport}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('score')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'score'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-amber-500/10'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Credit Score & Pre-Approval</span>
        </button>

        <button
          onClick={() => setActiveSubTab('momo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'momo'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-amber-500/10'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile Money Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guarantors')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'guarantors'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-amber-500/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community Guarantors ({references.length})</span>
        </button>
      </div>

      {/* TAB 1: SCORE OVERVIEW */}
      {activeSubTab === 'score' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Score Gauge Card */}
            <div className={`p-6 rounded-2xl border md:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {t.yourScore}
              </span>

              {/* Big Circular Score Dial */}
              <div className="relative w-36 h-36 my-2 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${((assessment.score - 300) / 550) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                    {assessment.score}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    / 850
                  </span>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold border mt-2 ${getScoreColor(assessment.score)}`}>
                {assessment.tier}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                Calculated via non-traditional MoMo ledger & peer vouching.
              </p>
            </div>

            {/* Pre-Approved Micro-Loan Limit & Terms */}
            <div className={`p-6 rounded-2xl border md:col-span-2 flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-amber-50 to-white border-amber-900/10 shadow-sm'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {t.approvedLimit}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Pre-Approved by SACCO Network
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight mb-2">
                  {assessment.maxLoanAmount.toLocaleString()} {assessment.currency}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Based on your consistent mobile turnover and <strong>{references.length} verified guarantors</strong>, you qualify for immediate working capital micro-loans from registered local SACCOs & Microfinances.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Monthly Interest</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      {assessment.recommendedInterestRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Monthly Turnover</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      {assessment.turnoverMonthly.toLocaleString()} {assessment.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Peer Trust Rating</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      {assessment.communityVouchScore}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-end">
                <button
                  onClick={onOpenPassport}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  View Official Credit Passport Certificate <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Score Factors */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Score Breakdown & Non-Traditional Credit Factors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{factor.label}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{factor.description}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs shrink-0">
                    +{factor.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score Growth Actions / Tips */}
          {assessment.improvementTips.length > 0 && (
            <div className={`p-5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-500/10 border-amber-500/20'
            }`}>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {t.boostTips}
              </h3>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {assessment.improvementTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MOBILE MONEY LEDGER */}
      {activeSubTab === 'momo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {t.momoTransactions}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged receipts verify income velocity and utility payment discipline.
              </p>
            </div>

            <button
              onClick={() => setShowTxModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addTransaction}</span>
            </button>
          </div>

          {/* Transaction Table / Cards */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-bold ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Counterparty / Details</th>
                    <th className="p-3">Reference No.</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{tx.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : tx.type === 'utility'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{tx.counterparty}</td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">{tx.reference}</td>
                      <td className={`p-3 text-right font-mono font-bold ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY GUARANTORS */}
      {activeSubTab === 'guarantors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {t.communityGuarantors}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peer vouching replaces traditional credit bureau files with real community social collateral.
              </p>
            </div>

            <button
              onClick={() => setShowRefModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addGuarantor}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {references.map((ref) => (
              <div
                key={ref.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ref.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium capitalize mb-2">
                    {ref.role.replace('_', ' ')} • Known for {ref.relationshipMonths} months
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    "{ref.notes}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{ref.phone}</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    Vouched: {ref.vouchAmount.toLocaleString()} {worker.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD TRANSACTION */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-amber-900/10 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">{t.addTransaction}</h3>

            <form onSubmit={handleCreateTx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Transaction Type</label>
                <select
                  value={txType}
                  onChange={(e: any) => setTxType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                >
                  <option value="income">Income / Customer Payment (+)</option>
                  <option value="utility">Electricity / Water / Token (-)</option>
                  <option value="payment">Supplier / Fuel Payment (-)</option>
                  <option value="airtime">Airtime / Data (-)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Amount ({worker.currency})</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  required
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Counterparty / Sender Name</label>
                <input
                  type="text"
                  value={txCounterparty}
                  onChange={(e) => setTxCounterparty(e.target.value)}
                  placeholder="e.g. Nyabugogo Market Buyer"
                  required
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. MoMo-984210"
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GUARANTOR */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-amber-900/10 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">{t.addGuarantor}</h3>

            <form onSubmit={handleCreateRef} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Guarantor Name</label>
                <input
                  type="text"
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="e.g. Pastor James / Market Chair"
                  required
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Role / Standing</label>
                <select
                  value={refRole}
                  onChange={(e: any) => setRefRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                >
                  <option value="cooperative_leader">Cooperative President / Executive</option>
                  <option value="market_chair">Market Chairperson / Trader Representative</option>
                  <option value="local_elder">Local Village Elder / Faith Leader</option>
                  <option value="fellow_trader">Registered Trade Associate</option>
                  <option value="landlord">Business Premises Landlord</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={refPhone}
                  onChange={(e) => setRefPhone(e.target.value)}
                  placeholder="e.g. +250 788 000 111"
                  required
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Guaranteed Amount ({worker.currency})</label>
                <input
                  type="number"
                  value={refAmount}
                  onChange={(e) => setRefAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Verify Guarantor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
