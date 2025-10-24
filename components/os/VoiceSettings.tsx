import React, { useContext } from 'react';
import { LanguageContext, TTSContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import useTTS from '../../hooks/useTTS';
import { translations } from '../../lib/i18n';

const VoiceSettings: React.FC = () => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const { selectedVoice, setSelectedVoice, playbackSpeed, setPlaybackSpeed } = useContext(TTSContext);
    const { availableVoices, speak } = useTTS();
    const currentText = translations.global[lang];

    const handleTestVoice = () => {
        const testPhrase = lang === 'en' 
            ? 'Hello, this is a test of the selected voice.' 
            : 'مرحباً، هذا اختبار للصوت المختار.';
        speak(testPhrase);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3">{lang === 'en' ? 'Voice & TTS Settings' : 'إعدادات الصوت و TTS'}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block mb-2 font-medium text-text-secondary">{currentText.ttsVoice}</label>
                    <div className="flex items-center gap-2">
                        <select 
                            value={selectedVoice} 
                            onChange={e => setSelectedVoice(e.target.value)} 
                            className="flex-1 p-2 rounded bg-background border text-text" 
                            style={{ borderColor: theme.colors.border }}
                        >
                            {availableVoices.map(voice => (
                                <option key={voice.name} value={voice.name}>
                                    {`${voice.name} (${voice.lang})`}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleTestVoice} className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors">
                            {lang === 'en' ? 'Test' : 'اختبار'}
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="speed-slider" className="block mb-2 font-medium text-text-secondary">
                        {currentText.ttsSpeed} ({playbackSpeed.toFixed(1)}x)
                    </label>
                    <input
                        id="speed-slider"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={playbackSpeed}
                        onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        style={{'--thumb-color': theme.colors.primary} as React.CSSProperties} // Custom property for thumb
                    />
                </div>
            </div>
        </div>
    );
};

export default VoiceSettings;