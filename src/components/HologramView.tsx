import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ScanLine } from 'lucide-react';

export default function HologramView({ isActive }: { isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setError(null);
        } else {
          setError("Camera API not supported on this device.");
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Camera access denied or unavailable.");
      }
    };

    if (isActive) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
      />
      
      {/* Overlay Filters */}
      <div className="absolute inset-0 bg-purple-900/10 pointer-events-none mix-blend-color" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] pointer-events-none opacity-50" />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center z-20">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-2">Sensor Array Offline</h3>
          <p className="text-[10px] text-white/50 uppercase tracking-wide">{error}</p>
        </div>
      )}

      {/* Hologram Core */}
      {!error && isActive && (
         <div className="relative z-10 flex flex-col items-center justify-center transform-gpu">
           <div className="text-[10px] uppercase font-bold tracking-[0.4em] text-purple-400 mb-12 flex items-center space-x-2">
             <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
             <span>Holographic Projection Active</span>
           </div>
           
           <div className="relative w-64 h-64 flex items-center justify-center">
             {/* Center Orb */}
             <motion.div 
               animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} 
               transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
               className="absolute w-24 h-24 bg-purple-500 rounded-full blur-2xl"
             />
             <div className="absolute w-16 h-16 bg-white rounded-full blur-md opacity-20" />
             <div className="absolute w-8 h-8 bg-white rounded-full opacity-90 shadow-[0_0_30px_#a855f7]" />
             
             {/* Rotating Rings */}
             <motion.div 
               animate={{ rotateZ: 360, rotateX: 20 }} 
               transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
               className="absolute w-full h-full border-2 border-purple-500/30 rounded-full border-t-purple-400"
             />
             <motion.div 
               animate={{ rotateZ: -360, rotateY: 30 }} 
               transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
               className="absolute w-56 h-56 border border-cyan-500/40 rounded-full border-b-cyan-400 border-l-cyan-400"
             />
             <motion.div 
               animate={{ rotateZ: 360, rotateX: 45, rotateY: 45 }} 
               transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
               className="absolute w-40 h-40 border-2 border-purple-400/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-full border-r-purple-300"
             />
           </div>

           {/* Scan Line effect */}
           <motion.div 
             initial={{ y: -150, opacity: 0 }}
             animate={{ y: 150, opacity: [0, 0.5, 0] }}
             transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
             className="absolute w-64 h-px bg-purple-400/50 shadow-[0_0_10px_#a855f7]"
           />

           <div className="mt-16 text-center">
             <div className="text-xl font-light tracking-widest text-purple-100">Projecting Presence</div>
             <div className="font-mono text-[9px] text-purple-400/50 mt-2 uppercase">Spatial mapping in progress...</div>
           </div>
         </div>
      )}
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500/40" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500/40" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/40" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-500/40" />
    </div>
  );
}
