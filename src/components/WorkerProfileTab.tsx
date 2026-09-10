import React, { useState } from 'react';
import { Language, WorkerProfile } from '../types';
import { UI_TRANSLATIONS } from '../data/knowledge';
import { User, Briefcase, MapPin, Phone, Building2, Save, Check } from 'lucide-react';

interface WorkerProfileTabProps {
  language: Language;
  isDarkMode: boolean;
  worker: WorkerProfile;
  onSaveWorker: (updated: WorkerProfile) => void;
}

export const WorkerProfileTab: React.FC<WorkerProfileTabProps> = ({
  language,
  isDarkMode,
  worker,
  onSaveWorker,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;

  const [form, setForm] = useState<WorkerProfile>(worker);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWorker(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 space-y-6">
      <div className={`p-6 rounded-2xl border ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.profileTab}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informal trade credentials registered in KoraTrust decentralised ledger.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Primary Trade / Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                placeholder="e.g. Boda Boda / Produce Market Trader / Carpenter"
                required
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Market Location / Region</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Money Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Registered Cooperative / Association</label>
              <input
                type="text"
                value={form.cooperativeName || ''}
                onChange={(e) => setForm({ ...form, cooperativeName: e.target.value })}
                placeholder="e.g. Nyabugogo Traders Co-op"
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Operating Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={`w-full p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-amber-200 text-slate-900'
                }`}
              >
                <option value="RWF">RWF - Rwandan Franc</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
                <option value="ETB">ETB - Ethiopian Birr</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="USD">USD - US Dollar ($)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile credentials updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Worker Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
