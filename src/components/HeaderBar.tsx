import React from 'react';
import { Language, DataMode } from '../types';
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from '../data/knowledge';
import { Wifi, WifiOff, Zap, ShieldCheck, Sun, Moon, Database } from 'lucide-react';

interface HeaderBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  dataMode: DataMode;
  onToggleDataMode: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  estimatedBytes: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  language,
  onLanguageChange,
  dataMode,
  onToggleDataMode,
  isDarkMode,
  onToggleTheme,
  estimatedBytes,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;

  return (
    <header className={`border-b transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-amber-900 text-amber-50 border-amber-800'
    }`}>
      {/* Top Banner: Low-Bandwidth & Network Status Strip */}
      <div className={`px-4 py-1.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 border-b ${
        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {dataMode === 'datasaver' ? t.netStatusLow : t.netStatusOnline}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
            <Database className="w-3 h-3 text-amber-400" />
            Data Used: {(estimatedBytes / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Data Saver Mode Switch */}
          <button
            onClick={onToggleDataMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              dataMode === 'datasaver'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-amber-800/60 hover:bg-amber-800 text-amber-100'
            }`}
            title="Toggle 2G Text Data Saver Mode"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{dataMode === 'datasaver' ? '2G Data Saver ON' : 'Data Saver OFF'}</span>
          </button>

          {/* Theme Switch */}
          <button
            onClick={onToggleTheme}
            className="p-1 rounded-md hover:bg-amber-800/60 text-amber-200 transition-colors"
            title="Toggle Contrast Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-200" />}
          </button>
        </div>
      </div>

      {/* Main Brand & Language Controls */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-md border border-amber-300/30 shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Afrilink AI <span className="text-amber-400 text-sm sm:text-base font-normal">| KoraTrust</span>
              </h1>
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-amber-200/80 line-clamp-1">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-amber-300/80 mr-1 shrink-0">
            Language:
          </span>
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'bg-amber-950/50 hover:bg-amber-800/70 text-amber-100 border border-amber-800/50'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
