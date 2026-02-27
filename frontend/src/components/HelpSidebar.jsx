import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function HelpSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Sidebar animation variants
    const sidebarVariants = {
        hidden: { x: '100%', opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }
    };

    // Backdrop animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <>
            {/* The Floating Action Button (FAB) */}
            <motion.button
                onClick={toggleSidebar}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#1A3668] to-[#12264a] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer z-[90] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#2D7A4D]/50 transition-shadow border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open Help"
            >
                <HelpCircle className="w-7 h-7" />
            </motion.button>

            {/* The Modal/Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Dimmed Backdrop (Click to close) */}
                        <motion.div
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
                            onClick={toggleSidebar}
                        />

                        {/* Modern Glassmorphic Sidebar */}
                        <motion.div
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="relative w-full max-w-sm h-full bg-white/80 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-white/50 flex flex-col pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                                <h2 className="text-xl font-bold tracking-tight text-[#1A3668] flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-[#2D7A4D]" />
                                    Project Morpheus FAQ
                                </h2>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Q1 */}
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                        <ShieldCheck className="w-4 h-4 text-[#1A3668]" />
                                        What is an Immutable Audit Log?
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                        An immutable audit log is a continuous, unchangeable record of every action taken in the system. Once data (such as a medical record access attempt) is written to this log, it cannot be edited, deleted, or tampered with by anyone—not even system administrators. This guarantees absolute transparency.
                                    </p>
                                </div>

                                {/* Q2 */}
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                        <Lock className="w-4 h-4 text-[#2D7A4D]" />
                                        How is my data private?
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                        Your sensitive files (The Vault) are heavily encrypted. The Zero-Trust Gatekeeper ensures that doctors and specialists can only decypher and view your records if they prove their identity and have your explicit cryptographic permission.
                                    </p>
                                </div>

                                {/* Q3 */}
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        What happens in an emergency?
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                        In life-threatening situations where you cannot grant permission, verified Emergency Responders can use the "Emergency Override." This grants them immediate access to your "Life Packet" (blood type, allergies) but logs their identity on the blockchain for later auditing to prevent abuse.
                                    </p>
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200/50 bg-gray-50/50 text-center text-xs text-gray-500 font-medium">
                                Designed for Zero-Trust Medical Integrity.
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
