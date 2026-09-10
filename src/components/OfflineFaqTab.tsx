import React, { useState } from 'react';
import { Language, OfflineTopic } from '../types';
import { OFFLINE_FAQS, UI_TRANSLATIONS } from '../data/knowledge';
import { Search, ShieldCheck, Sprout, Users, Volume2, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface OfflineFaqTabProps {
  language: Language;
  isDarkMode: boolean;
  onSelectQuestion: (question: string) => void;
}

export const OfflineFaqTab: React.FC<OfflineFaqTabProps> = ({
  language,
  isDarkMode,
  onSelectQuestion,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFaqs = OFFLINE_FAQS.filter((faq) => {
    const titleText = faq.title[language] || faq.title.english;
    const contentText = faq.content[language] || faq.content.english;
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-emerald-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 space-y-4">
      {/* Offline Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0">
            0G
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.offlineCacheTab} (Zero Internet Needed)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.offlineNotice}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
          24 Topics Offline Ready
        </div>
      </div>

      {/* Category Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search offline topics in your language..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
                : 'bg-white border-amber-200 text-slate-900 placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'mobile_money', 'agriculture', 'community'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaqs.map((faq) => {
          const title = faq.title[language] || faq.title.english;
          const content = faq.content[language] || faq.content.english;
          const questions = faq.quickQuestions[language] || faq.quickQuestions.english || [];

          return (
            <div
              key={faq.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
                  : 'bg-white border-amber-900/10 hover:border-amber-500/50 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getIcon(faq.iconName)}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                    {title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  {content}
                </p>
              </div>

              {/* Quick Prompt Questions */}
              {questions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Related Questions:
                  </span>
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectQuestion(q)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between group transition-colors"
                    >
                      <span className="truncate pr-2">{q}</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
