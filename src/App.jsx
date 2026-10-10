import React, { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);

  useEffect(() => {
    // Poll safely for the global Puter object
    if (typeof window !== 'undefined' && window.puter?.ai) {
      setAiReady(true);
      return;
    }

    const checkReady = setInterval(() => {
      if (typeof window !== 'undefined' && window.puter?.ai) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 500);

    return () => clearInterval(checkReady);
  }, []);

  const summarizeText = async () => {
    if (!window.puter || !window.puter.ai) {
      setError("Puter AI SDK is missing. Make sure the script tag is in your HTML head block.");
      return;
    }

    setLoading(true);
    setSummary("");
    setError("");
    
    try {
      const promptText = `Please summarize this text cleanly and concisely: ${text}`;
      
      // Make the call using Puter's default lightweight model configuration
      const response = await window.puter.ai.chat(promptText, { model: 'gpt-5.4-nano'});
      
      console.log("Puter Raw Response:", response);

      if (!response) {
        throw new Error("Empty response received from the AI engine.");
      }

      // Explicit string extraction to protect React from rendering complex engine objects
      let processedText = "";
      if (typeof response === 'string') {
        processedText = response;
      } else if (response.text) {
        processedText = response.text;
      } else if (response.message?.content) {
        // Fallback for earlier SDK iterations
        processedText = typeof response.message.content === 'string' 
          ? response.message.content 
          : String(response.message.content);
      } else {
        processedText = String(response);
      }

      setSummary(processedText);

    } catch (err) {
      console.error("Caught internal error:", err);
      setError(`Summarization Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br via-slate-900 to-blue-900 flex flex-col items-center justify-center p-4 gap-6 text-white">
      
      <h1 className="text-4xl sm:text-6xl font-extrabold text-center tracking-tight bg-gradient-to-r from-blue-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
         AI-Summarizer
      </h1>

      <div className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors duration-300 ${
        aiReady 
          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      }`}>
        {aiReady ? "● AI Engine Ready" : "○ Waiting for Puter SDK..."}
      </div>

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <textarea
          className="w-full h-44 p-4 bg-slate-950/50 text-slate-100 placeholder:text-slate-500 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed resize-none outline-none"
          placeholder="Enter or paste your long text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!aiReady || loading}
        />

        <button
          onClick={summarizeText}
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          disabled={!aiReady || loading || !text.trim()}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Summarize"
          )}
        </button>
      
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {summary && (
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl whitespace-pre-wrap text-slate-200 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Summary Result</h3>
            <p className="text-slate-300 leading-relaxed">{summary}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-sm break-words">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;