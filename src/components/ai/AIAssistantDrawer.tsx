import React, { useState, useRef, useEffect } from 'react';
import { getSafetyAssistantResponse, speakText } from '../../lib/geminiAI';
import { EmergencyPhrasebook } from './EmergencyPhrasebook';
import {
  Sparkles,
  X,
  Send,
  Volume2,
  Mic,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSosFromAi?: () => void;
  onOpenReportFromAi?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionSuggestion?: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onTriggerSosFromAi,
  onOpenReportFromAi,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'phrasebook'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: '👋 Hello! I am your **Global Gennie 24/7 AI Safety Assistant**.\n\nI can help you navigate local emergencies across Navi Mumbai, auto-classify incidents, find nearby hospitals, or translate emergency phrases into 10 languages.\n\nHow can I support your safety today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await getSafetyAssistantResponse(q);
      const assistantMsg: ChatMessage = {
        id: 'm-' + (Date.now() + 1),
        sender: 'assistant',
        text: response.text,
        actionSuggestion: response.actionSuggestion,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'm-' + (Date.now() + 1),
          sender: 'assistant',
          text: 'Emergency Services are operational 24/7. Dial **112** or press the **SOS** button for immediate dispatch.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Speech to text toggle simulation/Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      // Fallback prompt
      const sampleQueries = [
        'I need an ambulance, severe allergic attack',
        'Where is the nearest tourist police station?',
        'Someone stole my backpack and wallet at the café',
        'How do I report a missing child in the monument?',
      ];
      const picked = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setInputQuery(picked);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-base">Global Gennie AI Safety Companion</h2>
                  <span className="bg-purple-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-300/30">
                    24/7 LIVE
                  </span>
                </div>
                <p className="text-xs text-purple-100">Multi-lingual AI Guidance & Emergency Triage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation: Chat vs Phrasebook */}
          <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-purple-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat & Triage</span>
            </button>
            <button
              onClick={() => setActiveTab('phrasebook')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'phrasebook'
                  ? 'bg-white text-purple-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Emergency Phrasebook</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'phrasebook' ? (
              <EmergencyPhrasebook />
            ) : (
              <div className="space-y-4">
                {/* Chat Messages */}
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.text}</div>

                        {/* Action Suggestions inside message */}
                        {!isUser && m.actionSuggestion && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-2">
                            {m.actionSuggestion.includes('SOS') ? (
                              <button
                                onClick={() => {
                                  onClose();
                                  if (onTriggerSosFromAi) onTriggerSosFromAi();
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{m.actionSuggestion}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onClose();
                                  if (onOpenReportFromAi) onOpenReportFromAi();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{m.actionSuggestion}</span>
                              </button>
                            )}
                            <button
                              onClick={() => speakText(m.text)}
                              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Thinking animation */}
                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 p-2.5 rounded-xl w-fit">
                    <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Analyzing safety intent & consulting local guidelines...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Quick Prompts Carousel */}
          {activeTab === 'chat' && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => handleSend('I need an emergency ambulance right now')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold hover:bg-rose-200"
              >
                🚨 Medical Emergency
              </button>
              <button
                onClick={() => handleSend('My passport and bag were stolen')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200"
              >
                👜 Stolen Passport / Theft
              </button>
              <button
                onClick={() => handleSend('Where is the nearest tourist police kiosk?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200"
              >
                👮 Nearest Police
              </button>
              <button
                onClick={() => handleSend('Separated from my tour member')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold hover:bg-purple-200"
              >
                👥 Lost Person
              </button>
            </div>
          )}

          {/* Input Footer */}
          {activeTab === 'chat' && (
            <div className="p-3.5 border-t border-slate-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask anything or describe your situation..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
