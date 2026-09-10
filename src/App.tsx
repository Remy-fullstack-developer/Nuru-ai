/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, DataMode, WorkerProfile, MobileTransaction, CommunityReference } from './types';
import { SAMPLE_WORKER, SAMPLE_TRANSACTIONS, SAMPLE_REFERENCES, UI_TRANSLATIONS } from './data/knowledge';
import { HeaderBar } from './components/HeaderBar';
import { AIAssistantTab } from './components/AIAssistantTab';
import { OfflineFaqTab } from './components/OfflineFaqTab';
import { CreditAssessmentTab } from './components/CreditAssessmentTab';
import { WorkerProfileTab } from './components/WorkerProfileTab';
import { CreditPassportModal } from './components/CreditPassportModal';
import { MessageSquare, Award, HelpCircle, User, Zap, ShieldCheck } from 'lucide-react';
import { initAuth, db, doc, setDoc, getDoc, collection, addDoc, query, where, onSnapshot } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [language, setLanguage] = useState<Language>('kinyarwanda');
  const [dataMode, setDataMode] = useState<DataMode>('standard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [estimatedBytes, setEstimatedBytes] = useState<number>(840);

  const [activeTab, setActiveTab] = useState<'ai' | 'credit' | 'offline_faq' | 'profile'>('ai');
  const [selectedQuestionForAI, setSelectedQuestionForAI] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const [worker, setWorker] = useState<WorkerProfile>(SAMPLE_WORKER);
  const [transactions, setTransactions] = useState<MobileTransaction[]>(SAMPLE_TRANSACTIONS);
  const [references, setReferences] = useState<CommunityReference[]>(SAMPLE_REFERENCES);

  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync Worker Profile with Firebase Firestore
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, 'profiles', currentUser.uid);
    
    // Listen to profile updates
    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setWorker(snap.data() as WorkerProfile);
      } else {
        // Initialize default profile in Firestore
        setDoc(profileRef, { ...SAMPLE_WORKER, userId: currentUser.uid });
      }
    }, (err) => {
      console.warn('Firestore profile sync offline/fallback mode:', err);
    });

    return () => unsub();
  }, [currentUser]);

  // Sync Mobile Money Transactions with Firebase Firestore
  useEffect(() => {
    if (!currentUser) return;

    const txQuery = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(txQuery, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: MobileTransaction[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MobileTransaction, 'id'>),
        }));
        setTransactions(loaded);
      } else {
        // Seed default transactions to Firestore
        SAMPLE_TRANSACTIONS.forEach((tx) => {
          addDoc(collection(db, 'transactions'), {
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            counterparty: tx.counterparty,
            status: tx.status,
            reference: tx.reference,
            userId: currentUser.uid,
          });
        });
      }
    }, (err) => {
      console.warn('Firestore transactions sync offline/fallback mode:', err);
    });

    return () => unsub();
  }, [currentUser]);

  // Sync Community Guarantors / References with Firebase Firestore
  useEffect(() => {
    if (!currentUser) return;

    const refQuery = query(collection(db, 'guarantors'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(refQuery, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: CommunityReference[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CommunityReference, 'id'>),
        }));
        setReferences(loaded);
      } else {
        // Seed default references to Firestore
        SAMPLE_REFERENCES.forEach((ref) => {
          addDoc(collection(db, 'guarantors'), {
            name: ref.name,
            role: ref.role,
            phone: ref.phone,
            relationshipMonths: ref.relationshipMonths,
            vouchAmount: ref.vouchAmount,
            trustRating: ref.trustRating,
            verificationStatus: ref.verificationStatus,
            notes: ref.notes,
            userId: currentUser.uid,
          });
        });
      }
    }, (err) => {
      console.warn('Firestore guarantors sync offline/fallback mode:', err);
    });

    return () => unsub();
  }, [currentUser]);

  const handleAddDataUsage = (bytes: number) => {
    setEstimatedBytes((prev) => prev + bytes);
  };

  const handleSelectOfflineQuestion = (questionText: string) => {
    setSelectedQuestionForAI(questionText);
    setActiveTab('ai');
  };

  const handleSaveWorkerProfile = async (updated: WorkerProfile) => {
    setWorker(updated);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'profiles', currentUser.uid), {
          ...updated,
          userId: currentUser.uid,
        });
      } catch (e) {
        console.error('Failed to update profile in Firebase:', e);
      }
    }
  };

  const handleAddTransaction = async (newTx: MobileTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    if (currentUser) {
      try {
        await addDoc(collection(db, 'transactions'), {
          date: newTx.date,
          type: newTx.type,
          amount: newTx.amount,
          currency: newTx.currency,
          counterparty: newTx.counterparty,
          status: newTx.status,
          reference: newTx.reference,
          userId: currentUser.uid,
        });
      } catch (e) {
        console.error('Failed to add transaction to Firebase:', e);
      }
    }
  };

  const handleAddReference = async (newRef: CommunityReference) => {
    setReferences((prev) => [...prev, newRef]);
    if (currentUser) {
      try {
        await addDoc(collection(db, 'guarantors'), {
          name: newRef.name,
          role: newRef.role,
          phone: newRef.phone,
          relationshipMonths: newRef.relationshipMonths,
          vouchAmount: newRef.vouchAmount,
          trustRating: newRef.trustRating,
          verificationStatus: newRef.verificationStatus,
          notes: newRef.notes,
          userId: currentUser.uid,
        });
      } catch (e) {
        console.error('Failed to add guarantor to Firebase:', e);
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <HeaderBar
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        dataMode={dataMode}
        onToggleDataMode={() => setDataMode((prev) => (prev === 'standard' ? 'datasaver' : 'standard'))}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        estimatedBytes={estimatedBytes}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'ai'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-amber-900/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.aiTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('credit')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'credit'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-amber-900/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t.creditTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('offline_faq')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'offline_faq'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-amber-900/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.offlineCacheTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-amber-900/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.profileTab}</span>
          </button>
        </nav>

        {/* Tab Views */}
        {activeTab === 'ai' && (
          <AIAssistantTab
            language={language}
            dataMode={dataMode}
            isDarkMode={isDarkMode}
            onAddDataUsage={handleAddDataUsage}
            userId={currentUser?.uid}
          />
        )}

        {activeTab === 'credit' && (
          <CreditAssessmentTab
            language={language}
            isDarkMode={isDarkMode}
            worker={worker}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            references={references}
            onAddReference={handleAddReference}
            onOpenPassport={() => setShowPassportModal(true)}
          />
        )}

        {activeTab === 'offline_faq' && (
          <OfflineFaqTab
            language={language}
            isDarkMode={isDarkMode}
            onSelectQuestion={handleSelectOfflineQuestion}
          />
        )}

        {activeTab === 'profile' && (
          <WorkerProfileTab
            language={language}
            isDarkMode={isDarkMode}
            worker={worker}
            onSaveWorker={handleSaveWorkerProfile}
          />
        )}
      </main>

      {/* Credit Passport Modal */}
      {showPassportModal && (
        <CreditPassportModal
          language={language}
          worker={worker}
          transactions={transactions}
          references={references}
          onClose={() => setShowPassportModal(false)}
        />
      )}
    </div>
  );
}
