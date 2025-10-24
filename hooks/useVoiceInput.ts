import { useState, useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '../App';

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access experimental SpeechRecognition properties which are not in standard TS DOM types.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const useVoiceInput = () => {
    const { lang } = useContext(LanguageContext);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [error, setError] = useState('');
    
    // FIX: Use `any` for the recognition ref type as SpeechRecognition is not a standard type in the TS DOM library.
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            setIsListening(true);
            setError('');
            setInterimTranscript('');
            setFinalTranscript('');
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                setError('No speech detected. Please try again.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
            } else {
                setError(`An error occurred: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let final = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInterimTranscript(interim);
            if (final) {
                setFinalTranscript(prev => prev + final);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
        }
    }, [lang]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Handle cases where start() is called while already started
                console.error("Could not start listening:", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        interimTranscript,
        finalTranscript,
        error,
        startListening,
        stopListening,
    };
};

export default useVoiceInput;