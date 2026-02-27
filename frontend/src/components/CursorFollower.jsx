import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CursorFollower() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // Using useSpring for fluid, lag-free physics
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 16); // Center the 32px ring
            cursorY.set(e.clientY - 16);
        };

        const handleMouseOver = (e) => {
            // Check if hovering over interactive elements (buttons, links, inputs)
            const isClickable = e.target.closest('button, a, input, [role="button"]');
            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* The actual dot that strictly follows the cursor */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-[var(--color-primary-cyan)] rounded-full pointer-events-none z-[100]"
                animate={{
                    x: mousePosition.x - 4, // Center the 8px dot
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1, // Hide dot when hovering to focus on ring
                    opacity: isHovering ? 0 : 1
                }}
                transition={{ duration: 0 }} // Instant follow
            />

            {/* The fluid glowing ring that uses spring physics */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border-2 border-[var(--color-primary-cyan)] rounded-full pointer-events-none z-[99] shadow-[0_0_10px_var(--color-primary-cyan)]"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1, // Scale up on hover
                    opacity: isHovering ? 0.8 : 0.4,
                    borderWidth: isHovering ? "2px" : "1.5px"
                }}
            />
        </>
    );
}
