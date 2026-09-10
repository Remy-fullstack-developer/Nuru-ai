import React, { useState, useRef, useEffect } from 'react';
import { Language, DataMode, QAMessage } from '../types';
import { UI_TRANSLATIONS, LANGUAGE_OPTIONS } from '../data/knowledge';
import { Send, Volume2, VolumeX, Sparkles, Zap, WifiOff, RefreshCw, CheckCircle2, MessageSquare, Lightbulb } from 'lucide-react';
import { db, collection, addDoc, query, where, onSnapshot } from '../lib/firebase';

interface AIAssistantTabProps {
  language: Language;
  dataMode: DataMode;
  isDarkMode: boolean;
  onAddDataUsage: (bytes: number) => void;
  userId?: string;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  language,
  dataMode,
  isDarkMode,
  onAddDataUsage,
  userId,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.kinyarwanda;

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync QA messages with Firebase Firestore if userId is present
  useEffect(() => {
    if (!userId) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome-1',
            sender: 'assistant',
            text: getWelcomeMessage(language),
            timestamp: Date.now(),
            language,
            suggestedFollowUps: getQuickPrompts(language),
          },
        ]);
      }
      return;
    }

    const q = query(collection(db, 'qa_messages'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: QAMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp,
            language: data.language || language,
            isCached: data.isCached || false,
          };
        }).sort((a, b) => a.timestamp - b.timestamp);

        setMessages(loaded);
      } else {
        // Welcome message
        const welcomeMsg: QAMessage = {
          id: 'welcome-1',
          sender: 'assistant',
          text: getWelcomeMessage(language),
          timestamp: Date.now(),
          language,
          suggestedFollowUps: getQuickPrompts(language),
        };
        setMessages([welcomeMsg]);
      }
    }, (err) => {
      console.warn('Firestore QA messages offline mode:', err);
    });

    return () => unsub();
  }, [userId, language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function getWelcomeMessage(lang: Language): string {
    switch (lang) {
      case 'kinyarwanda':
        return 'Muraho! Ndi Afrilink AI. Nshobora kugusubiza mu Kinyarwanda ku byerekeye ubuhinzi, mobile money, isoko, kurenza ibinyoma no kuzamura inguzanyo yawe mu koperative.';
      case 'swahili':
        return 'Jambo! Mimi ni Afrilink AI. Ninaweza kukusaidia kwa Kiswahili kuhusu kilimo, usalama wa M-Pesa, biashara ndogondogo na alama za KoraTrust.';
      case 'luganda':
        return 'Oli Otya! Nze Afrilink AI. Nnyinza okukuyamba mu Luganda ku byobulimi, eby’ensimbi ku simu, ne loni z’amangu mu kibiina.';
      case 'amharic':
        return 'ሰላም! እኔ Afrilink AI ነኝ። በእርሻ፣ በሞባይል ገንዘብ ደህንነት እና በብድር ምዘና ዙሪያ በአማርኛ መልስ ለመስጠት ዝግጁ ነኝ።';
      case 'yoruba':
        return 'Ẹ ǹlẹ́ o! Afrilink AI ni mi. Mo le ran ọ lọwọ ni ede Yoruba lori ajẹmo, aabo owo foonu ati igbelewongbese KoraTrust.';
      case 'french':
        return 'Bonjour! Je suis Afrilink AI. Je peux vous répondre en français sur l\'agriculture, la sécurité du Mobile Money et l\'accès au crédit informel.';
      default:
        return 'Hello! I am Afrilink AI. I can answer your questions in African languages about agriculture, mobile money safety, local trade, and credit ratings.';
    }
  }

  function getQuickPrompts(lang: Language): string[] {
    switch (lang) {
      case 'kinyarwanda':
        return [
          'Ntekeje nte kurengera imyaka mu izuba?',
          'Ndokora iki niba maze koherereza SMS y’ibinyoma?',
          'Ntekeje nte kuzamura inguzanyo mu koperative?',
        ];
      case 'swahili':
        return [
          'Jinsi ya kutengeneza mbolea ya asili?',
          'Jinsi ya kukagua miamala ya M-Pesa kwa usalama?',
          'Njia za kuongeza alama za KoraTrust?',
        ];
      case 'luganda':
        return [
          'Nsobola ntya okuterekera bizinensi yange?',
          'Nkole ntya bwe nfuna SMS y’obufere?',
          'Obubonero bwa loni bubalwa batya?',
        ];
      case 'amharic':
        return [
          'የሞባይል ገንዘብ ደህንነት እንዴት ይጠበቃል?',
          'የበቆሎ በሽታዎችን እንዴት ማከም ይቻላል?',
          'የብድር ነጥቤን እንዴት ማሳደግ እችላለሁ?',
        ];
      case 'yoruba':
        return [
          'Bawo ni n ṣe le tọju owo oko mi?',
          'Kí ni n ó ṣe tí n bá rí SMS ẹ̀tan?',
        ];
      case 'french':
        return [
          'Comment fabriquer du compost biologique?',
          'Comment reconnaître un faux SMS Mobile Money?',
          'Comment améliorer mon score KoraTrust?',
        ];
      default:
        return [
          'How to protect crops during dry season?',
          'How to spot fake Mobile Money payment SMS?',
          'How to raise my KoraTrust credit score?',
        ];
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const queryStr = textToSend || inputPrompt;
    if (!queryStr.trim() || isLoading) return;

    const userMsg: QAMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryStr,
      timestamp: Date.now(),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    if (userId) {
      try {
        await addDoc(collection(db, 'qa_messages'), {
          sender: 'user',
          text: queryStr,
          timestamp: userMsg.timestamp,
          language,
          userId,
        });
      } catch (e) {
        console.error('Failed to save user message to Firebase:', e);
      }
    }

    // Record data usage estimation
    const requestBytes = queryStr.length * 2 + 150;
    onAddDataUsage(requestBytes);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryStr,
          language,
          dataSaver: dataMode === 'datasaver',
        }),
      });

      const data = await response.json();
      const responseBytes = (data.answer || '').length * 2 + 200;
      onAddDataUsage(responseBytes);

      const answerText = data.answer || getFallbackAnswer(queryStr, language);

      const assistantMsg: QAMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: Date.now(),
        isCached: data.isFallback,
        language,
        suggestedFollowUps: data.suggestedFollowUps || getQuickPrompts(language),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (userId) {
        try {
          await addDoc(collection(db, 'qa_messages'), {
            sender: 'assistant',
            text: answerText,
            timestamp: assistantMsg.timestamp,
            language,
            userId,
            isCached: data.isFallback || false,
          });
        } catch (e) {
          console.error('Failed to save AI response to Firebase:', e);
        }
      }
    } catch (err) {
      console.error('Failed to query AI:', err);
      // Offline fallback
      const fallbackText = getFallbackAnswer(queryStr, language);
      const assistantMsg: QAMessage = {
        id: `ai-off-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: Date.now(),
        isCached: true,
        language,
        suggestedFollowUps: getQuickPrompts(language),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (userId) {
        try {
          await addDoc(collection(db, 'qa_messages'), {
            sender: 'assistant',
            text: fallbackText,
            timestamp: assistantMsg.timestamp,
            language,
            userId,
            isCached: true,
          });
        } catch (e) {
          console.error('Failed to save fallback AI response to Firebase:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  function getFallbackAnswer(q: string, lang: Language): string {
    if (lang === 'kinyarwanda') {
      return '1. Rinda Mobile Money yawe: Buri gihe reba ubutumwa buvuye mu kimenyetso cya MTN MoMo/Airtel. Nta mukozi uzagukoresha PIN yawe.\n2. Bika inyemezabwishyu zawe mu KoraTrust ku kora inguzanyo mu makoperative.\n3. Ukoresha ifumbire y\'umwimerere ku kora umusaruro w\'ibishyimbo n\'ibigori.';
    } else if (lang === 'swahili') {
      return '1. Hakikisha unapokea jumbe rasmi za M-Pesa. Usitoe PIN yako kwa mtu yeyote.\n2. Weka kumbukumbu za miamala kwenye KoraTrust ili uweze kupata mkopo wa biashara ndogo.\n3. Weka majani makavu shambani (mulching) kuhifadhi unyevu.';
    }
    return '1. Always verify Mobile Money payment SMS directly from the official operator.\n2. Keep your receipts logged in KoraTrust to qualify for SACCO micro-loans.\n3. Add community guarantors to unlock lower interest rates.';
  }

  // Web Speech API text-to-speech
  const handleReadAloud = (msg: QAMessage) => {
    if ('speechSynthesis' in window) {
      if (activeSpeakingId === msg.id) {
        window.speechSynthesis.cancel();
        setActiveSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg.text);
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onend = () => setActiveSpeakingId(null);
      utterance.onerror = () => setActiveSpeakingId(null);

      setActiveSpeakingId(msg.id);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported on this browser version.');
    }
  };

  const currentLangMeta = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] max-w-5xl mx-auto p-2 sm:p-4">
      {/* 2G / Data Saver Info Bar */}
      <div className={`mb-3 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
        dataMode === 'datasaver'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
      }`}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
          <span className="font-semibold">
            {currentLangMeta.flag} {currentLangMeta.nativeName} Mode
          </span>
          <span className="text-slate-500 dark:text-slate-400">|</span>
          <span>{dataMode === 'datasaver' ? t.dataUsageEstimate : 'Full Response Speed Active'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] opacity-80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Cache Ready</span>
        </div>
      </div>

      {/* Quick Prompt Carousel */}
      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold shrink-0 text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Quick Questions:
        </span>
        {getQuickPrompts(language).map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-200 shadow-sm'
            }`}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-amber-900/10 shadow-inner'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = activeSpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%] sm:max-w-[85%] ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold">{isUser ? 'You' : 'Afrilink AI'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.isCached && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                    <WifiOff className="w-2.5 h-2.5" /> Offline Cache
                  </span>
                )}
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-br-none shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                    : 'bg-white text-slate-900 rounded-bl-none border border-amber-100 shadow-sm'
                }`}
              >
                {msg.text}
              </div>

              {/* Message Controls (Read Aloud) */}
              {!isUser && (
                <div className="mt-1.5 flex items-center gap-2 px-1">
                  <button
                    onClick={() => handleReadAloud(msg)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        <span>{t.stopAudio}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t.readAloud}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Afrilink AI is preparing your response in {currentLangMeta.nativeName}...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={t.askPlaceholder}
          disabled={isLoading}
          className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
              : 'bg-white border-amber-200 text-slate-900 placeholder-slate-400 shadow-sm'
          }`}
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 transition-all shrink-0"
        >
          <span>{t.sendBtn}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
