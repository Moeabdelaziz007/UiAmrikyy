import { useState, useEffect, useContext } from 'react';
import { TTSContext, LanguageContext } from '../App';

const useTTS = () => {
    const { selectedVoice, playbackSpeed } = useContext(TTSContext);
    const { lang } = useContext(LanguageContext);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const getVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };

        getVoices();
        // Voices are loaded asynchronously
        window.speechSynthesis.onvoiceschanged = getVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel(); // Stop any speech on unmount
        };
    }, []);

    const speak = (text: string) => {
        if (!window.speechSynthesis) {
            console.error('Speech Synthesis not supported in this browser.');
            return;
        }

        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find the selected voice object
        const voice = availableVoices.find(v => v.name === selectedVoice);

        if (voice) {
            utterance.voice = voice;
        } else {
            // Fallback to a voice that matches the current app language
            const languageVoice = availableVoices.find(v => v.lang.startsWith(lang));
            if (languageVoice) {
                utterance.voice = languageVoice;
            }
        }
        
        utterance.rate = playbackSpeed;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return {
        isSpeaking,
        availableVoices,
        speak,
        cancel,
    };
};

export default useTTS;