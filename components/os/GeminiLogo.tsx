import React from 'react';
import { motion } from 'framer-motion';

interface GeminiLogoProps {
  className?: string;
}

const GeminiLogo: React.FC<GeminiLogoProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Amrikyy QuantumOS Logo"
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Outer Orbit */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Inner Orbit */}
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 1, opacity: 0 }}
        animate={{ pathLength: 0, opacity: 0.2 }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
      />

      {/* Gemini-style Star */}
      <motion.path
        d="M50 35 L55 45 L65 50 L55 55 L50 65 L45 55 L35 50 L45 45 Z"
        fill="url(#gemini-gradient)"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.5 }}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="20s"
          repeatCount="indefinite"
        />
      </motion.path>
    </svg>
  );
};

export default GeminiLogo;