"use client";

import { motion } from "framer-motion";

export function LoadingTransition() {
    return (
        <motion.div
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
    );
} 