import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const VoiceWaveform: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="flex justify-center items-center h-full w-full gap-1">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                    animate={{ height: ['20%', '80%', '20%'] }}
                    transition={{
                        duration: 1.2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
};

export default VoiceWaveform;