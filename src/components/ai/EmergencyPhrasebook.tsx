import React, { useState } from 'react';
import { EMERGENCY_PHRASES, SUPPORTED_LANGUAGES, speakText } from '../../lib/geminiAI';
import { Volume2, Copy, Check, Globe } from 'lucide-react';

export const EmergencyPhrasebook: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[1];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Language Selector Chips */}
      <div>
        <label className="block text-xs font-extrabold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600 shrink-0" />
          <span>TRANSLATE TO LOCAL LANGUAGE</span>
        </label>
        
        {/* Generously padded, clean wrapping language pills */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            const simpleName = lang.name.split(' ')[0];
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/60'
                }`}
              >
                <span
                  className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {lang.code.toUpperCase()}
                </span>
                <span>{simpleName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phrases List */}
      <div className="space-y-3">
        {EMERGENCY_PHRASES.map((phrase) => {
          const trans = phrase.translations[selectedLang] || { text: phrase.english };
          return (
            <div
              key={phrase.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {phrase.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakText(trans.text, selectedLang)}
                    className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Speak pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(trans.text, phrase.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Copy text"
                  >
                    {copiedId === phrase.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* English source */}
              <p className="text-xs font-medium text-slate-600 mb-2 italic">
                "{phrase.english}"
              </p>

              {/* Translated text */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {trans.text}
                </p>
                {trans.phonetic && (
                  <p className="text-xs text-purple-700 mt-1 font-mono">
                    Phonetic: {trans.phonetic}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
