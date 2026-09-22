import { SupportedLanguage } from '../types.js';

type SpeakingListener = (isSpeaking: boolean) => void;

export class AudioAssistant {
  private static recognition: any = null;
  private static isSpeaking = false;
  private static listeners: Set<SpeakingListener> = new Set();
  private static cachedVoices: SpeechSynthesisVoice[] = [];

  static {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public static subscribe(listener: SpeakingListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach(l => {
      try {
        l(speaking);
      } catch (_) {}
    });
  }

  public static isSpeechSupported(): { recognition: boolean; synthesis: boolean } {
    const recognition = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const synthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return { recognition, synthesis };
  }

  public static getLangCode(lang: SupportedLanguage): string {
    switch (lang) {
      case 'mr':
        return 'mr-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  /**
   * Starts listening to farmer's voice input in Marathi, Hindi, or English
   */
  public static startListening(
    lang: SupportedLanguage,
    onResult: (transcript: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): { stop: () => void } {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      onError('Speech Recognition is not supported in this browser. Please type your message.');
      onEnd();
      return { stop: () => {} };
    }

    try {
      this.stopListening();
      this.stopSpeaking();
      const rec = new SpeechRecognitionClass();
      rec.lang = this.getLangCode(lang);
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        if (transcript) {
          onResult(transcript, isFinal);
        }
      };

      rec.onerror = (event: any) => {
        const errType = event.error;
        if (errType === 'no-speech') {
          onError('कोणताही आवाज ऐकू आला नाही. कृपया पुन्हा बोला (No speech detected).');
        } else if (errType === 'not-allowed') {
          onError('मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझरमध्ये मायक्रोफोन सुरू करा (Microphone access denied).');
        } else {
          onError(`आवाज नोंदवण्यात अडचण: ${errType || 'कृपया पुन्हा प्रयत्न करा'}`);
        }
      };

      rec.onend = () => {
        onEnd();
      };

      rec.start();
      this.recognition = rec;

      return {
        stop: () => {
          try {
            rec.stop();
          } catch (_) {}
        }
      };
    } catch (e: any) {
      onError(e.message || 'Could not start voice recognition');
      onEnd();
      return { stop: () => {} };
    }
  }

  public static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }
  }

  /**
   * Speaks out advice in Marathi, Hindi, or English with intelligent voice fallback
   */
  public static speak(
    text: string,
    lang: SupportedLanguage = 'mr',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech

      // Clean markdown, symbols and abbreviations for natural Indian voice synthesis
      let cleanText = text
        .replace(/[*_#`~>]/g, '')
        .replace(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 रुपये ')
        .replace(/₹/g, ' रुपये ')
        .replace(/\/kg/gi, ' प्रति किलो ')
        .replace(/\/qtl/gi, ' प्रति क्विंटल ')
        .replace(/APMC/gi, ' एपीएमसी ')
        .replace(/Kasara Ghat/gi, ' कसारा घाट ')
        .replace(/Nashik/gi, ' नाशिक ')
        .replace(/Lasalgaon/gi, ' लासलगाव ')
        .replace(/Vashi/gi, ' वाशी ')
        .replace(/tonnes/gi, ' टन ')
        .replace(/quintals?/gi, ' क्विंटल ')
        .replace(/%/g, ' टक्के ')
        .replace(/km/gi, ' किलोमीटर ')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = this.getLangCode(lang);
      utterance.rate = 0.92; // Deliberate, clear pace for farmers
      utterance.pitch = 1.0;

      // Select matching voice
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      
      let matchedVoice: SpeechSynthesisVoice | undefined;
      if (lang === 'mr') {
        // Look for Marathi voice first
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('mr'));
        // If Marathi voice not installed on OS, Hindi voice reads Devanagari script cleanly
        if (!matchedVoice) {
          matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
        }
      } else if (lang === 'hi') {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
      } else {
        matchedVoice = voices.find(v => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en'));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        this.setSpeaking(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.setSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.setSpeaking(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.setSpeaking(false);
      if (onEnd) onEnd();
    }
  }

  public static stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }

  public static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
