import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import { translations } from '../../../lib/i18n';
import { TaskHistoryEntry } from '../../../types';
import { nexusEvents } from '../../../services/mockSocketService';
import { Play, Pause, Send, Plus, Trash2, Wand2 } from 'lucide-react';
import MediaMaestro from './MediaMaestro';

// FIX: Changed to a named export to resolve a module resolution error.
export const SharedMediaLounge: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];

    const [inputUrl, setInputUrl] = useState('');
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const playerRef = useRef<any>(null);
    const isPlayerReady = useRef(false);
    const isLocalAction = useRef(false);

    const extractVideoId = (url: string): string | null => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    useEffect(() => {
        const handleVideoChange = (videoId: string) => {
            setCurrentVideoId(videoId);
            if (playerRef.current && isPlayerReady.current) {
                isLocalAction.current = true;
                playerRef.current.loadVideoById(videoId);
                setTimeout(() => {
                    setCurrentVideoTitle(playerRef.current?.getVideoData()?.title || '');
                    isLocalAction.current = false;
                }, 500);
            }
        };

        const handlePlaybackState = (isPlaying: boolean) => {
            if (playerRef.current && isPlayerReady.current && !isLocalAction.current) {
                isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
            }
        };

        nexusEvents.on('video:change', handleVideoChange);
        nexusEvents.on('video:playback', handlePlaybackState);

        const onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('yt-player', {
                height: '100%', width: '100%', videoId: currentVideoId || undefined,
                playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0 },
                events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
            });
        };

        const onPlayerReady = () => { isPlayerReady.current = true; };

        const onPlayerStateChange = (event: any) => {
            if (isLocalAction.current) return;
            isLocalAction.current = true;
            const playerState = (window as any).YT.PlayerState;
            if (event.data === playerState.PLAYING) {
                nexusEvents.emit('video:playback', true);
            } else if (event.data === playerState.PAUSED) {
                nexusEvents.emit('video:playback', false);
            }
            setCurrentVideoTitle(playerRef.current?.getVideoData()?.title || '');
            setTimeout(() => { isLocalAction.current = false; }, 100);
        };

        if (!(window as any).YT || !(window as any).YT.Player) {
            (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        } else { onYouTubeIframeAPIReady(); }

        return () => {
            nexusEvents.off('video:change', handleVideoChange);
            nexusEvents.off('video:playback', handlePlaybackState);
            playerRef.current?.destroy?.();
        };
    }, []);

    const handleAddVideo = () => {
        const videoId = extractVideoId(inputUrl);
        if (videoId) {
            nexusEvents.emit('video:change', videoId);
            setInputUrl('');
        } else {
            alert(lang === 'ar' ? "رابط يوتيوب غير صالح" : "Invalid YouTube URL");
        }
    };

    return (
        <div className="h-full w-full flex flex-col lg:flex-row gap-2 p-2">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
                    <div id="yt-player" className="w-full h-full"></div>
                    {!currentVideoId && (
                        <div className="absolute inset-0 flex items-center justify-center text-center text-text-secondary bg-surface p-4">
                            <p>{lang === 'en' ? 'Add a YouTube video to start a shared viewing experience!' : 'أضف فيديو يوتيوب لبدء تجربة مشاهدة مشتركة!'}</p>
                        </div>
                    )}
                </div>
                <div className="p-2 bg-surface rounded-lg flex items-center gap-2">
                    <input
                        type="text" value={inputUrl} onChange={e => setInputUrl(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddVideo()}
                        placeholder={currentText.placeholders.youtubeUrl}
                        className="flex-1 p-2 bg-background border rounded-md focus:ring-2 focus:ring-primary"
                        style={{ borderColor: theme.colors.border }}
                    />
                    <button onClick={handleAddVideo} className="p-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"><Plus size={20} /></button>
                    <button 
                        onClick={() => setIsAssistantOpen(!isAssistantOpen)} 
                        className={`p-2 rounded-md hover:opacity-90 transition-all ${isAssistantOpen ? 'bg-secondary text-white' : 'bg-surface border'}`}
                        style={{ borderColor: theme.colors.border, backgroundColor: isAssistantOpen ? theme.colors.secondary : theme.colors.surface }}
                        title={currentText.tasks.aiAssistant}
                        disabled={!currentVideoId}
                    >
                        <Wand2 size={20} />
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {isAssistantOpen && currentVideoId && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '18rem', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-shrink-0"
                    >
                        <MediaMaestro videoTitle={currentVideoTitle} onTaskComplete={onTaskComplete} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
