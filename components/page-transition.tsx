"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.95,
        filter: "blur(10px)"
    },
    enter: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.7,
            ease: [0.61, 1, 0.88, 1],
            scale: {
                type: "spring",
                damping: 25,
                stiffness: 100
            }
        }
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        filter: "blur(10px)",
        transition: {
            duration: 0.5,
            ease: [0.61, 1, 0.88, 1]
        }
    }
};

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
                style={{
                    width: "100%",
                    height: "100%",
                    transformOrigin: "center"
                }}
                className="flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
} 