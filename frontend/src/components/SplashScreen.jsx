import React from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999] overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 opacity-20 -z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2D7A4D]/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Logo/Brand Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex flex-col items-center gap-6 mb-12"
            >
                {/* Logo Image or Fallback */}
                <motion.img
                    src="/jeevanconnectlogo.png"
                    alt="JeevanConnect"
                    className="w-32 h-32 object-contain drop-shadow-lg"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Brand Text */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight">
                        <span className="text-white">Jeevan</span>
                        <span className="text-[#39FF14]">Connect</span>
                    </h1>
                    <p className="text-[#39FF14]/80 text-sm font-semibold mt-2 tracking-widest uppercase">
                        Zero-Trust Medical Blockchain
                    </p>
                </div>
            </motion.div>

            {/* Scanning Progress Bar */}
            <motion.div
                className="w-64 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {/* Progress Bar */}
                <div className="relative h-1 bg-gray-900 rounded-full overflow-hidden border border-[#2D7A4D]/30">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2D7A4D] to-[#39FF14] shadow-lg shadow-[#39FF14]/50"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                </div>

                {/* Scanning Text */}
                <motion.p
                    className="text-center text-xs font-mono text-[#39FF14] tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <span className="animate-pulse">Initializing</span>
                    <span className="inline-block ml-1 animate-bounce">•</span>
                </motion.p>
            </motion.div>

            {/* Floating Security Badge */}
            <motion.div
                className="fixed bottom-8 right-8 flex items-center gap-2 text-xs font-semibold text-[#39FF14]/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></div>
                Secure initialization
            </motion.div>
        </div>
    );
}
