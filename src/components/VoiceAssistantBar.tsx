import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types.js';
import { AudioAssistant } from '../utils/audioAssistant.js';
import { TRANSLATIONS } from '../utils/translations.js';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, Waves, Radio } from 'lucide-react';

interface VoiceAssistantBarProps {
  lang: SupportedLanguage;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeContext?: string;
  selectedCommodity?: string;
  farmerLocation?: string;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  lang,
  onSendMessage,
  isLoading,
  activeContext,
  selectedCommodity,
  farmerLocation
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState<string>('');
  const autoSendTimeoutRef = useRef<any>(null);

  const t = TRANSLATIONS[lang].chatbot;

  // Listen to audio assistant speaking state
  useEffect(() => {
    const unsubscribe = AudioAssistant.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
    };
  }, []);

  const quickPrompts = {
    mr: [
      { label: '🧅 लासलगाव कांदा भाव', query: 'लासलगाव बाजार समितीत आज कांद्याचा मोडल भाव काय आहे?' },
      { label: '🍅 टोमॅटो वाशी vs नाशिक', query: 'टोमॅटोसाठी नाशिक एपीएमसी की वाशी मुंबई जास्त फायदेशीर आहे?' },
      { label: '🫘 सोयाबीन लातूर दर', query: 'सोयाबीनचा लातूर बाजार समितीत आजचा Agmarknet दर सांगा.' },
      { label: '🍇 द्राक्षे सांगली भाव', query: 'सांगली आणि तासगाव बाजारात द्राक्षांचा सध्या काय भाव चालू आहे?' },
      { label: '🥭 डाळिंब सोलापूर दर', query: 'सोलापूर बाजारात भगवा डाळिंबाचा आजचा भाव काय आहे?' },
      { label: '🚚 कसारा घाट व डिझेल', query: 'नाशिकहून मुंबई वाशीला माल पाठवताना कसारा घाट व डिझेलचा काय हिशोब आहे?' },
    ],
    hi: [
      { label: '🧅 लासलगांव प्याज भाव', query: 'लासलगांव मंडी में आज प्याज का मोडल भाव क्या है?' },
      { label: '🍅 टमाटर नासिक vs वाशी', query: 'टमाटर के लिए नासिक और वाशी मंडी में कहां बेहतर भाव मिलेगा?' },
      { label: '🫘 सोयाबीन लातुर मंडी', query: 'लातुर मंडी में सोयाबीन का आज का Agmarknet भाव बताएं।' },
      { label: '🍇 अंगूर सांगली रेट', query: 'सांगली और नासिक में अंगूर का क्या बाजार भाव चल रहा है?' },
      { label: '🚚 डीजल व टोल खर्च', query: 'मुंबई वाशी माल भेजने पर कसारा घाट और डीजल का क्या खर्च आता है?' },
    ],
    en: [
      { label: '🧅 Lasalgaon Onion Rate', query: 'What is the current Agmarknet modal price for Onion in Lasalgaon?' },
      { label: '🍅 Tomato Nashik vs Vashi', query: 'Compare Tomato rates between Nashik and Vashi APMC with transit costs.' },
      { label: '🫘 Soybean Latur Mandi', query: 'What is today\'s Soybean rate in Latur APMC according to Agmarknet?' },
      { label: '🍇 Grapes Sangli Price', query: 'What is the modal price for export and local grapes in Sangli?' },
      { label: '🚚 Kasara Ghat Transit Risk', query: 'What is the diesel and Kasara Ghat transit delay impact on net realization?' },
    ]
  };

  const activePrompts = quickPrompts[lang] || quickPrompts.en;

  const toggleRecording = () => {
    if (isRecording) {
      AudioAssistant.stopListening();
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    setIsRecording(true);
    setTranscriptPreview('');

    AudioAssistant.startListening(
      lang,
      (transcript, isFinal) => {
        setInputText(transcript);
        setTranscriptPreview(transcript);

        // If user finishes full sentence, auto-submit smoothly after short pause
        if (isFinal && transcript.trim().length > 3) {
          if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
          autoSendTimeoutRef.current = setTimeout(() => {
            handleSend(transcript);
            AudioAssistant.stopListening();
            setIsRecording(false);
          }, 800);
        }
      },
      () => {
        setIsRecording(false);
      },
      (err) => {
        setSpeechError(err);
        setIsRecording(false);
      }
    );
  };

  const handleSend = (overrideText?: string) => {
    const textToSend = (overrideText || inputText).trim();
    if (!textToSend || isLoading) return;

    if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
    AudioAssistant.stopListening();
    setIsRecording(false);

    onSendMessage(textToSend);
    setInputText('');
    setTranscriptPreview('');
    setSpeechError(null);
  };

  const handleQuickPrompt = (query: string) => {
    if (isLoading) return;
    handleSend(query);
  };

  const handleStopSpeaking = () => {
    AudioAssistant.stopSpeaking();
  };

  return (
    <div className="space-y-3.5">
      {/* Real-time Agmarknet & Voice Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide">
            {lang === 'mr'
              ? 'महाराष्ट्र AGMARKNET थेट डेटाबेस जोडलेला आहे (Gemini 3.8 Flash AI)'
              : (lang === 'hi' ? 'महाराष्ट्र AGMARKNET लाइव डाटा सक्रिय (Gemini 3.8 Flash)' : 'Live Maharashtra Agmarknet Database Connected (Gemini Flash AI)')}
          </span>
        </div>

        {/* Speaking Audio Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-600/50 px-3 py-1 rounded-full text-purple-300 animate-pulse">
            <Waves className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'mr' ? 'सल्लागार बोलत आहे...' : (lang === 'hi' ? 'सलाहकार बोल रहा है...' : 'Voice Advisor Speaking...')}</span>
            <button
              onClick={handleStopSpeaking}
              className="ml-1 text-[10px] bg-purple-900 hover:bg-purple-800 text-white px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"
            >
              <VolumeX className="w-3 h-3" />
              {lang === 'mr' ? 'थांबवा' : 'Stop'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Voice Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {lang === 'mr' ? 'थेट व्हॉईस प्रश्न (क्लिक करून ऐका):' : (lang === 'hi' ? 'त्वरित आवाज सवाल (क्लिक करें):' : 'Instant Agmarknet Voice Queries (Click to Ask):')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn_quick_voice_chip_${idx}`}
              onClick={() => handleQuickPrompt(p.query)}
              disabled={isLoading}
              className="text-xs bg-[#181a32] hover:bg-[#23274c] active:scale-95 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-[#2d3158] hover:border-purple-500/80 transition-all shadow-xs flex items-center gap-1.5 font-mono group disabled:opacity-50"
            >
              <span>{p.label}</span>
              <Radio className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {speechError && (
        <div className="text-xs text-amber-200 bg-amber-950/50 border border-amber-800/70 p-2.5 rounded-xl font-mono flex items-center justify-between">
          <span>{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="text-[10px] text-amber-400 hover:text-amber-200 underline ml-2"
          >
            बंद करा
          </button>
        </div>
      )}

      {/* Voice & Text Input Box */}
      <div className={`flex items-center gap-2 bg-[#16182c] border ${isRecording ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-[#2c3055] focus-within:border-purple-500'} rounded-2xl p-2 transition-all shadow-md`}>
        {/* Microphone Button with Pulse Animation */}
        <button
          type="button"
          id="btn_mic_voice_record"
          onClick={toggleRecording}
          title={isRecording ? 'Stop Recording' : (lang === 'mr' ? 'माईक सुरू करा (बोला)' : 'Start Voice Input')}
          className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.6)]'
              : 'bg-purple-900/60 hover:bg-purple-700 text-purple-200 hover:text-white border border-purple-600/40'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text / Voice Input Field */}
        <input
          type="text"
          id="input_voice_chat_text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            isRecording
              ? (lang === 'mr' ? '🎙️ आवाज नोंदवत आहे... बोला (उदा. कांद्याचा आजचा भाव काय आहे?)' : t.listening)
              : (lang === 'mr' ? 'माईकवर बोला किंवा प्रश्न टाईप करा (उदा. लासलगाव कांदा भाव, सोयाबीन लातूर...)' : t.speakPrompt)
          }
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none px-2 font-mono"
        />

        {/* Send Button */}
        <button
          type="button"
          id="btn_send_voice_msg"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold p-3 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Recording Waveform & Live Feedback */}
      {isRecording && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs font-mono text-rose-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="font-semibold">
              {lang === 'mr' ? 'तुमचा आवाज रेकॉर्ड होत आहे... (बोलणे संपल्यावर आपोआप पाठवले जाईल)' : 'Listening live... speak your market query.'}
            </span>
          </div>

          {/* Equalizer Wave Simulation */}
          <div className="flex items-end gap-1 h-4">
            <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms] h-3"></span>
            <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms] h-4"></span>
            <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms] h-2"></span>
            <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:75ms] h-4"></span>
          </div>
        </div>
      )}
    </div>
  );
};
