import React from 'react';
import { Language, WorkerProfile, MobileTransaction, CommunityReference, CreditAssessment } from '../types';
import { UI_TRANSLATIONS } from '../data/knowledge';
import { calculateCreditScore } from '../utils/creditCalculator';
import { X, Printer, ShieldCheck, QrCode, Award, CheckCircle2, Building2 } from 'lucide-react';

interface CreditPassportModalProps {
  language: Language;
  worker: WorkerProfile;
  transactions: MobileTransaction[];
  references: CommunityReference[];
  onClose: () => void;
}

export const CreditPassportModal: React.FC<CreditPassportModalProps> = ({
  language,
  worker,
  transactions,
  references,
  onClose,
}) => {
  const assessment: CreditAssessment = calculateCreditScore(transactions, references, worker);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-amber-900/20 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-amber-900 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">KoraTrust Micro-Credit Passport Certificate</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-amber-800 text-amber-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Certificate Top Banner */}
          <div className="border-4 border-amber-900/80 p-6 rounded-2xl bg-amber-50/40 relative">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-900/20 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase block mb-1">
                  OFFICIAL NON-TRADITIONAL CREDIT FILE
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                  KoraTrust Micro-Credit Passport
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Issued by Afrilink AI & Community Financial Trust Network
                </p>
              </div>

              {/* QR Code Representation */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-16 h-16 bg-slate-900 text-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-full h-full text-amber-400" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">
                  VERIFIED-MFI-PASS
                </span>
              </div>
            </div>

            {/* Applicant Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant Name</span>
                <span className="font-bold text-slate-900 text-sm">{worker.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Occupation</span>
                <span className="font-bold text-slate-900">{worker.occupation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-bold text-slate-900">{worker.location}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">MoMo Account</span>
                <span className="font-mono font-bold text-slate-900">{worker.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cooperative Name</span>
                <span className="font-bold text-slate-900">{worker.cooperativeName || 'Independent Trader'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Issue Date</span>
                <span className="font-mono font-bold text-slate-900">{new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Score & Limit Box */}
            <div className="my-6 p-4 rounded-xl bg-amber-900 text-amber-50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-bold">
                  KoraTrust Score
                </span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  {assessment.score}
                </span>
                <span className="text-[10px] block text-amber-200">{assessment.tier}</span>
              </div>

              <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-amber-800 pt-3 sm:pt-0 sm:pl-4 text-left">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-bold">
                  Pre-Approved Working Capital Loan Limit
                </span>
                <span className="text-2xl font-black font-mono text-white">
                  {assessment.maxLoanAmount.toLocaleString()} {assessment.currency}
                </span>
                <p className="text-[11px] text-amber-200 mt-0.5">
                  Recommended SACCO Monthly Rate: <strong>{assessment.recommendedInterestRate}%</strong>
                </p>
              </div>
            </div>

            {/* Community Guarantor Signatures */}
            <div>
              <h4 className="text-xs font-bold uppercase text-amber-900 tracking-wider mb-2 border-b border-amber-900/10 pb-1">
                Verified Community Guarantor Signatures
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {references.slice(0, 4).map((ref) => (
                  <div key={ref.id} className="p-2.5 rounded-lg border border-amber-900/20 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ref.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 capitalize">{ref.role.replace('_', ' ')} • {ref.phone}</p>
                    <p className="text-[10px] text-amber-800 font-mono font-bold mt-1">
                      Guaranteed: {ref.vouchAmount.toLocaleString()} {worker.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="mt-6 pt-4 border-t border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>Certificate ID: KT-PASS-2026-981023</span>
              <span className="flex items-center gap-1 font-semibold text-amber-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Recognized by East & West African SACCO Unions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
