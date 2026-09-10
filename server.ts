import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Offline fallback mode will be used if API is invoked.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: African Language QA
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { prompt, language = 'kinyarwanda', dataSaver = false, topicContext = '' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if no API key present in container
      return res.json({
        answer: getFallbackAnswer(prompt, language),
        isFallback: true,
        language,
        suggestedFollowUps: getLanguageFollowUps(language),
      });
    }

    const languageInstructionMap: Record<string, string> = {
      kinyarwanda: 'You MUST answer strictly in Kinyarwanda (Ikinyarwanda). Use clear, everyday Rwandan terms.',
      swahili: 'You MUST answer strictly in Kiswahili (East African Swahili). Use clear, direct language.',
      luganda: 'You MUST answer strictly in Luganda. Use practical Uganda everyday language.',
      amharic: 'You MUST answer strictly in Amharic (አማርኛ).',
      yoruba: 'You MUST answer strictly in Yoruba (Èdè Yorùbá).',
      french: 'You MUST answer in clear, accessible French suited for West & Central African micro-entrepreneurs.',
      english: 'You MUST answer in simple, direct English tailored for informal sector workers.',
    };

    const targetLangInstruction = languageInstructionMap[language] || languageInstructionMap.kinyarwanda;
    const lengthConstraint = dataSaver
      ? 'KEEP RESPONSE EXTREMELY CONCISE (under 100 words, maximum 3 bullet points) to save mobile data usage.'
      : 'Keep the response structured with short bullet points, friendly tone, and practical actionable advice.';

    const systemInstruction = `You are "Afrilink AI", an intelligent, empathetic low-bandwidth assistant built for informal workers, farmers, traders, and boda-boda operators across Africa.
${targetLangInstruction}
${lengthConstraint}
Focus topics: Agriculture, Mobile Money safety, small business micro-finance, health, and local trade.
Avoid long introduction or fluffy pleasantries. Give immediate, actionable steps.
If the user asks in a mixture of languages, respond in the requested language: ${language}.`;

    const userContent = topicContext
      ? `Topic Context: ${topicContext}\nUser Question: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const answer = response.text || getFallbackAnswer(prompt, language);

    return res.json({
      answer,
      isFallback: false,
      language,
      suggestedFollowUps: getLanguageFollowUps(language),
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const lang = req.body?.language || 'kinyarwanda';
    return res.json({
      answer: getFallbackAnswer(req.body?.prompt || '', lang),
      isFallback: true,
      error: error?.message || 'Server error',
      suggestedFollowUps: getLanguageFollowUps(lang),
    });
  }
});

// Fallback response generator when offline or no API key
function getFallbackAnswer(prompt: string, language: string): string {
  const p = prompt.toLowerCase();
  if (language === 'kinyarwanda') {
    if (p.includes('momo') || p.includes('amafaranga') || p.includes('nyemezabwishyu')) {
      return '1. Rinda SMS yawe: Buri gihe reba ko SMS ivuye mu izina rya MTN MoMo cyangwa Airtel Money, ntabwo ari numero isanzwe.\n2. Bika inyemezabwishyu zawe muri KoraTrust kugira ngo uzifashishe ubona inguzanyo mu makoperative.\n3. Nta mukozi uzakubaza PIN yawe.';
    }
    if (p.includes('imyaka') || p.includes('ubuhinzi') || p.includes('fumbire')) {
      return '1. Koresha ibyatsi biumbye (Mulching) kugira ngo ubutaka buhore bufite ubuyanja mu gihe cy’izuba.\n2. Vanga amase y’inka n’amazi hamwe n’ibimera byikubye ku kora ifumbire mu minsi 21.\n3. Bika inyandiko z’umusaruro muri KoraTrust.';
    }
    return 'Ubusanzwe: Afrilink AI iri kora mu buryo bwa Offline (Nta inthaneti). Urashobora gukoresha ububiko bw’ibibazo buhari cyangwa ukareba ikirangantego cyawe cy’inguzanyo muri KoraTrust.';
  } else if (language === 'swahili') {
    return '1. Hakikisha unapokea jumbe rasmi za M-Pesa/Mobile Money.\n2. Hifadhi risiti zako kwenye KoraTrust ili kuongeza alama zako za mkopo.\n3. Usitoe PIN yako kwa mtu yeyote.';
  } else {
    return 'Offline Mode Active: Your answer is retrieved from local device memory. Verify Mobile Money receipts and register community guarantors in KoraTrust to build your credit score.';
  }
}

function getLanguageFollowUps(language: string): string[] {
  switch (language) {
    case 'kinyarwanda':
      return [
        'Ndekeze nte kubona inguzanyo mu koperative?',
        'Ntekeje nte kumenya SMS y’ibinyoma?',
        'Uko bakora ifumbire y’umwimerere?',
      ];
    case 'swahili':
      return [
        'Jinsi ya kuongeza alama za KoraTrust?',
        'Njia za kuzuia utapeli wa M-Pesa?',
        'Jinsi ya kusajili wadhamini 3 wa jamii?',
      ];
    default:
      return [
        'How to boost my KoraTrust Credit Score?',
        'How to verify fake mobile money payment SMS?',
        'How to register community guarantors?',
      ];
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
