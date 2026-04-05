import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

export default function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  useEffect(() => {
    console.log("LoadingPage rendered");
    const timer = setTimeout(onLoadingComplete, 5000); // 5 seconds loading
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2c1e1e] z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <img 
          src="https://github.com/FairyOfTheBog/myimgsources/blob/main/my%20logo.png?raw=true" 
          alt="Logo" 
          className="w-64 h-64 object-contain" 
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
}
