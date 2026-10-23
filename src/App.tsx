import React, { useState, useEffect, useRef } from 'react';
import { initializeFirebase, initAuth, googleSignIn, getAccessToken, logout, db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Calendar, Disc3, Shield, Power, Mic, Send, Inbox, User as UserIcon, Volume2, VolumeX, Copy, Trash2, Check, Bell, PictureInPicture, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import HologramView from './components/HologramView';
import SoundVisualizer from './components/SoundVisualizer';

export interface ThemeConfig {
  name: string;
  lounge: {
    textAccent: string;
    textMuted: string;
    textBright: string;
    bgAccent: string;
    bgAccentHover: string;
    borderAccent: string;
    borderAccentLighter: string;
    accentSlider: string;
    shadowAccent: string;
    bgGradient: string;
    glowOrbColor: string;
    glowBorderColor: string;
    taglineText: string;
    btnModeBorder: string;
    btnActiveBorder: string;
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    cardHoverBorder: string;
    textAccent1: string;
    textAccent2: string;
    circleBg: string;
    circleBg2: string;
    loungeActiveText: string;
    loungeActiveBg: string;
    soundscapeActive: string;
    soundscapeUnselected: string;
    loungeControlIcon: string;
    loungeHoverInit: string;
    returnBtn: string;
  };
  terminal: {
    textAccent: string;
    textAccentMuted: string;
    textAccentLight: string;
    bgAccent: string;
    bgAccentHover: string;
    borderAccent: string;
    borderAccentLight: string;
    borderAccentLighter: string;
    focusBorder: string;
    glowDot: string;
    voiceGlow: string;
    canvasWaveColor: string;
    btnActiveBg: string;
    loadingDots: string;
    selectionColor: string;
    shadowGlow: string;
    glowBorderFull: string;
  };
}

export const THEMES: Record<'midnight' | 'ember' | 'arctic', ThemeConfig> = {
  midnight: {
    name: 'Midnight',
    lounge: {
      textAccent: 'text-indigo-400',
      textMuted: 'text-indigo-200/60',
      textBright: 'text-indigo-100/70',
      bgAccent: 'bg-indigo-600',
      bgAccentHover: 'bg-indigo-500',
      borderAccent: 'border-indigo-500/20',
      borderAccentLighter: 'border-indigo-500/10',
      accentSlider: 'accent-indigo-500',
      shadowAccent: 'shadow-[0_0_15px_rgba(99,102,241,0.25)]',
      bgGradient: 'bg-gradient-to-t from-indigo-950/20 to-[#050507]',
      glowOrbColor: 'bg-indigo-500/20',
      glowBorderColor: 'border-indigo-500/30',
      taglineText: 'text-indigo-300',
      btnModeBorder: 'border-indigo-500/50 text-indigo-200 bg-indigo-500/10',
      btnActiveBorder: 'border-indigo-500/30',
      cardBg: 'bg-gradient-to-br from-indigo-950/40 to-[#0a0a0f]',
      cardBorder: 'border-indigo-500/50',
      cardShadow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
      cardHoverBorder: 'hover:border-indigo-500/30',
      textAccent1: 'text-indigo-200',
      textAccent2: 'text-indigo-200/50',
      circleBg: 'bg-indigo-200',
      circleBg2: 'bg-indigo-500',
      loungeActiveText: 'text-indigo-400 hover:text-indigo-300',
      loungeActiveBg: 'bg-indigo-500/10',
      soundscapeActive: 'bg-indigo-500 text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)]',
      soundscapeUnselected: 'text-indigo-200/40 hover:text-indigo-200',
      loungeControlIcon: 'text-indigo-300/60 hover:text-indigo-300',
      loungeHoverInit: 'group-hover:bg-indigo-500/20 group-hover:text-indigo-200',
      returnBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]',
    },
    terminal: {
      textAccent: 'text-cyan-400',
      textAccentMuted: 'text-cyan-400/60',
      textAccentLight: 'text-cyan-500',
      bgAccent: 'bg-cyan-500',
      bgAccentHover: 'bg-cyan-400',
      borderAccent: 'border-cyan-500/50',
      borderAccentLight: 'border-cyan-500/20',
      borderAccentLighter: 'border-cyan-500/10',
      focusBorder: 'focus-within:border-cyan-500/50',
      glowDot: 'bg-cyan-500',
      voiceGlow: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      canvasWaveColor: 'rgba(34, 211, 238, 0.8)',
      btnActiveBg: 'bg-cyan-500/10 border-cyan-500 text-cyan-400',
      loadingDots: 'bg-cyan-400',
      selectionColor: 'selection:bg-cyan-500/30',
      shadowGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      glowBorderFull: 'border-cyan-500/40',
    }
  },
  ember: {
    name: 'Ember',
    lounge: {
      textAccent: 'text-amber-400',
      textMuted: 'text-amber-200/60',
      textBright: 'text-amber-100/70',
      bgAccent: 'bg-amber-500',
      bgAccentHover: 'bg-amber-400',
      borderAccent: 'border-amber-500/20',
      borderAccentLighter: 'border-amber-500/10',
      accentSlider: 'accent-amber-500',
      shadowAccent: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      bgGradient: 'bg-gradient-to-t from-amber-950/20 to-[#050507]',
      glowOrbColor: 'bg-amber-500/20',
      glowBorderColor: 'border-amber-500/30',
      taglineText: 'text-amber-300',
      btnModeBorder: 'border-amber-500/50 text-amber-200 bg-amber-500/10',
      btnActiveBorder: 'border-amber-500/30',
      cardBg: 'bg-gradient-to-br from-amber-950/40 to-[#0c0a09]',
      cardBorder: 'border-amber-500/50',
      cardShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      cardHoverBorder: 'hover:border-amber-500/30',
      textAccent1: 'text-amber-200',
      textAccent2: 'text-amber-200/50',
      circleBg: 'bg-amber-200',
      circleBg2: 'bg-amber-500',
      loungeActiveText: 'text-amber-400 hover:text-amber-300',
      loungeActiveBg: 'bg-amber-500/10',
      soundscapeActive: 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      soundscapeUnselected: 'text-amber-200/40 hover:text-amber-200',
      loungeControlIcon: 'text-amber-300/60 hover:text-amber-300',
      loungeHoverInit: 'group-hover:bg-amber-500/20 group-hover:text-amber-200',
      returnBtn: 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    },
    terminal: {
      textAccent: 'text-orange-400',
      textAccentMuted: 'text-orange-400/60',
      textAccentLight: 'text-orange-500',
      bgAccent: 'bg-orange-500',
      bgAccentHover: 'bg-orange-400',
      borderAccent: 'border-orange-500/50',
      borderAccentLight: 'border-orange-500/20',
      borderAccentLighter: 'border-orange-500/10',
      focusBorder: 'focus-within:border-orange-500/50',
      glowDot: 'bg-orange-500',
      voiceGlow: 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      canvasWaveColor: 'rgba(249, 115, 22, 0.8)',
      btnActiveBg: 'bg-orange-500/10 border-orange-500 text-orange-400',
      loadingDots: 'bg-orange-400',
      selectionColor: 'selection:bg-orange-500/30',
      shadowGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      glowBorderFull: 'border-orange-500/40',
    }
  },
  arctic: {
    name: 'Arctic',
    lounge: {
      textAccent: 'text-sky-400',
      textMuted: 'text-sky-300/60',
      textBright: 'text-sky-100/70',
      bgAccent: 'bg-sky-500',
      bgAccentHover: 'bg-sky-400',
      borderAccent: 'border-sky-500/20',
      borderAccentLighter: 'border-sky-500/10',
      accentSlider: 'accent-sky-500',
      shadowAccent: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]',
      bgGradient: 'bg-gradient-to-t from-sky-950/20 to-[#050507]',
      glowOrbColor: 'bg-sky-500/20',
      glowBorderColor: 'border-sky-500/30',
      taglineText: 'text-sky-300',
      btnModeBorder: 'border-sky-500/50 text-sky-200 bg-sky-500/10',
      btnActiveBorder: 'border-sky-500/30',
      cardBg: 'bg-gradient-to-br from-sky-950/40 to-[#0a0f14]',
      cardBorder: 'border-sky-500/50',
      cardShadow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
      cardHoverBorder: 'hover:border-sky-500/30',
      textAccent1: 'text-sky-200',
      textAccent2: 'text-sky-200/50',
      circleBg: 'bg-sky-200',
      circleBg2: 'bg-sky-500',
      loungeActiveText: 'text-sky-400 hover:text-sky-300',
      loungeActiveBg: 'bg-sky-500/10',
      soundscapeActive: 'bg-sky-500 text-black font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]',
      soundscapeUnselected: 'text-sky-200/40 hover:text-sky-200',
      loungeControlIcon: 'text-sky-300/60 hover:text-sky-300',
      loungeHoverInit: 'group-hover:bg-sky-500/20 group-hover:text-sky-200',
      returnBtn: 'bg-sky-500 hover:bg-sky-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]',
    },
    terminal: {
      textAccent: 'text-emerald-400',
      textAccentMuted: 'text-emerald-400/60',
      textAccentLight: 'text-emerald-500',
      bgAccent: 'bg-emerald-500',
      bgAccentHover: 'bg-emerald-400',
      borderAccent: 'border-emerald-500/50',
      borderAccentLight: 'border-emerald-500/20',
      borderAccentLighter: 'border-emerald-500/10',
      focusBorder: 'focus-within:border-emerald-500/50',
      glowDot: 'bg-emerald-500',
      voiceGlow: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      canvasWaveColor: 'rgba(16, 185, 129, 0.8)',
      btnActiveBg: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
      loadingDots: 'bg-emerald-400',
      selectionColor: 'selection:bg-emerald-500/30',
      shadowGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      glowBorderFull: 'border-emerald-500/40',
    }
  }
};

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [mode, setMode] = useState<'lounge' | 'jarvis' | 'hologram'>('lounge');
  const [voice, setVoice] = useState<'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede' | 'Zephyr'>('Kore');
  const [uiTheme, setUiTheme] = useState<'midnight' | 'ember' | 'arctic'>(() => {
    return (localStorage.getItem('ui_theme') as any) || 'midnight';
  });

  const currentTheme = THEMES[uiTheme];

  useEffect(() => {
    localStorage.setItem('ui_theme', uiTheme);
  }, [uiTheme]);
  
  // Ambient Lounge Soundscape State
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const [ambientMuted, setAmbientMuted] = useState<boolean>(false);
  const [ambientSoundscape, setAmbientSoundscape] = useState<'blend' | 'rain' | 'hum'>('blend');

  const ambientAudioRef = useRef<{
    ctx: AudioContext | null;
    masterGain: GainNode | null;
    rainVolGain: GainNode | null;
    lowHumGain: GainNode | null;
    noiseSec: AudioBufferSourceNode | null;
    lowHum: OscillatorNode | null;
    lfo: OscillatorNode | null;
  }>({
    ctx: null,
    masterGain: null,
    rainVolGain: null,
    lowHumGain: null,
    noiseSec: null,
    lowHum: null,
    lfo: null
  });

  const startAmbientSoundscape = () => {
    if (ambientAudioRef.current.ctx) {
      if (ambientAudioRef.current.ctx.state === 'suspended') {
        ambientAudioRef.current.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      ambientAudioRef.current.ctx = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientMuted ? 0 : ambientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      ambientAudioRef.current.masterGain = masterGain;

      // 1. RAIN SYNTHESIZER (Pink-ish Filtered Noise)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const outputData = noiseBuffer.getChannelData(0);
      
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        outputData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        outputData[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noiseSec = ctx.createBufferSource();
      noiseSec.buffer = noiseBuffer;
      noiseSec.loop = true;
      ambientAudioRef.current.noiseSec = noiseSec;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(500, ctx.currentTime);

      const rainVolGain = ctx.createGain();
      rainVolGain.gain.setValueAtTime(ambientSoundscape === 'hum' ? 0.0 : 0.45, ctx.currentTime);
      ambientAudioRef.current.rainVolGain = rainVolGain;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(rainVolGain.gain);

      noiseSec.connect(rainFilter);
      rainFilter.connect(rainVolGain);
      rainVolGain.connect(masterGain);

      // 2. TECH TERMINAL HUM
      const lowHum = ctx.createOscillator();
      lowHum.type = 'triangle';
      lowHum.frequency.setValueAtTime(65.41, ctx.currentTime); // Deep warm chord pitch
      ambientAudioRef.current.lowHum = lowHum;

      const lowHumFilter = ctx.createBiquadFilter();
      lowHumFilter.type = 'lowpass';
      lowHumFilter.frequency.setValueAtTime(95, ctx.currentTime);

      const lowHumGain = ctx.createGain();
      lowHumGain.gain.setValueAtTime(ambientSoundscape === 'rain' ? 0.0 : 0.35, ctx.currentTime);
      ambientAudioRef.current.lowHumGain = lowHumGain;

      const humLFO = ctx.createOscillator();
      humLFO.type = 'sine';
      humLFO.frequency.setValueAtTime(0.04, ctx.currentTime);
      
      const humLFOGain = ctx.createGain();
      humLFOGain.gain.setValueAtTime(15, ctx.currentTime);

      humLFO.connect(humLFOGain);
      humLFOGain.connect(lowHumFilter.frequency);

      lowHum.connect(lowHumFilter);
      lowHumFilter.connect(lowHumGain);
      lowHumGain.connect(masterGain);

      const lowHumHarmonic = ctx.createOscillator();
      lowHumHarmonic.type = 'sine';
      lowHumHarmonic.frequency.setValueAtTime(98.0, ctx.currentTime);
      lowHumHarmonic.connect(lowHumFilter);

      noiseSec.start();
      lfo.start();
      lowHum.start();
      humLFO.start();
      lowHumHarmonic.start();

      (ambientAudioRef.current as any).harmonic = lowHumHarmonic;
      (ambientAudioRef.current as any).humLFO = humLFO;
      ambientAudioRef.current.lfo = lfo;
    } catch (e) {
      console.error("Ambient Web Audio init failed:", e);
    }
  };

  const stopAmbientSoundscape = () => {
    const ref = ambientAudioRef.current;
    if (ref.masterGain && ref.ctx) {
      try {
        ref.masterGain.gain.setValueAtTime(ref.masterGain.gain.value, ref.ctx.currentTime);
        ref.masterGain.gain.exponentialRampToValueAtTime(0.001, ref.ctx.currentTime + 0.6);
      } catch (e) {
        ref.masterGain.gain.setValueAtTime(0, ref.ctx.currentTime);
      }
    }

    setTimeout(() => {
      try {
        if (ref.noiseSec) { ref.noiseSec.stop(); ref.noiseSec.disconnect(); }
        if (ref.lowHum) { ref.lowHum.stop(); ref.lowHum.disconnect(); }
        if (ref.lfo) { ref.lfo.stop(); ref.lfo.disconnect(); }
        if ((ref as any).harmonic) { (ref as any).harmonic.stop(); (ref as any).harmonic.disconnect(); }
        if ((ref as any).humLFO) { (ref as any).humLFO.stop(); (ref as any).humLFO.disconnect(); }
        if (ref.masterGain) ref.masterGain.disconnect();
      } catch (e) {
        // quiet cleanup
      }
      ref.ctx = null;
      ref.masterGain = null;
      ref.rainVolGain = null;
      ref.lowHumGain = null;
      ref.noiseSec = null;
      ref.lowHum = null;
      ref.lfo = null;
      (ref as any).harmonic = null;
      (ref as any).humLFO = null;
    }, 700);
  };

  useEffect(() => {
    if (mode === 'lounge') {
      startAmbientSoundscape();
    } else {
      stopAmbientSoundscape();
    }
    return () => {
      const ref = ambientAudioRef.current;
      if (ref.ctx) {
        // Quick absolute cleanup on destr/unmount
        try {
          if (ref.noiseSec) ref.noiseSec.stop();
          if (ref.lowHum) ref.lowHum.stop();
        } catch(e){}
      }
    };
  }, [mode]);

  useEffect(() => {
    const ref = ambientAudioRef.current;
    if (ref.ctx && ref.masterGain) {
      const targetVolume = ambientMuted ? 0 : ambientVolume;
      try {
        ref.masterGain.gain.setValueAtTime(ref.masterGain.gain.value, ref.ctx.currentTime);
        ref.masterGain.gain.linearRampToValueAtTime(targetVolume, ref.ctx.currentTime + 0.15);
      } catch (e) {
        ref.masterGain.gain.setValueAtTime(targetVolume, ref.ctx.currentTime);
      }
    }
  }, [ambientVolume, ambientMuted]);

  useEffect(() => {
    const ref = ambientAudioRef.current;
    if (ref.ctx) {
      const targetRain = ambientSoundscape === 'hum' ? 0.0 : 0.45;
      const targetHum = ambientSoundscape === 'rain' ? 0.0 : 0.35;
      try {
        if (ref.rainVolGain) {
          ref.rainVolGain.gain.setValueAtTime(ref.rainVolGain.gain.value, ref.ctx.currentTime);
          ref.rainVolGain.gain.linearRampToValueAtTime(targetRain, ref.ctx.currentTime + 0.4);
        }
        if (ref.lowHumGain) {
          ref.lowHumGain.gain.setValueAtTime(ref.lowHumGain.gain.value, ref.ctx.currentTime);
          ref.lowHumGain.gain.linearRampToValueAtTime(targetHum, ref.ctx.currentTime + 0.4);
        }
      } catch (e) {
        if (ref.rainVolGain) ref.rainVolGain.gain.setValueAtTime(targetRain, ref.ctx.currentTime);
        if (ref.lowHumGain) ref.lowHumGain.gain.setValueAtTime(targetHum, ref.ctx.currentTime);
      }
    }
  }, [ambientSoundscape]);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    initializeFirebase().then(() => {
      initAuth(
        (user, token) => {
          setUser(user);
          setToken(token);
          setNeedsAuth(false);
        },
        () => setNeedsAuth(true)
      );
    });
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setMode('lounge');
  };

  return (
    <div className={`h-screen w-screen bg-[#050507] text-[#e0e0e0] font-sans ${currentTheme.terminal.selectionColor} overflow-hidden relative flex flex-col p-6 select-none`}>
      {/* High Density grid background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(${uiTheme === 'midnight' ? '#00f0ff' : uiTheme === 'ember' ? '#f59e0b' : '#38bdf8'} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

      {needsAuth ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 relative px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-sm w-full">
            <div className="mb-8 relative mx-auto w-24 h-24 flex items-center justify-center">
              <Shield className={`w-10 h-10 ${currentTheme.terminal.textAccent} opacity-80`} />
              <div className={`absolute inset-0 border ${currentTheme.terminal.glowBorderFull} rounded-full scale-110`} />
              <div className={`absolute inset-0 border-2 ${currentTheme.terminal.borderAccentLight} rounded-full scale-150 animate-pulse`} />
            </div>
            <div className={`text-[10px] uppercase tracking-[0.3em] ${currentTheme.terminal.textAccent} font-bold mb-2`}>Protocol Active</div>
            <h1 className="text-2xl font-light tracking-tighter text-white mb-4">J.A.R.V.I.S.</h1>
            <p className="text-white/40 mb-8 font-light text-[10px] tracking-wide leading-relaxed uppercase">
              Secure authentication required.<br/>Initialize workspace connection.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`text-black flex items-center justify-center space-x-3 w-full py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all active:scale-[0.98] ${currentTheme.terminal.bgAccent} hover:${currentTheme.terminal.bgAccentHover} ${currentTheme.terminal.shadowGlow}`}
            >
              {isLoggingIn ? (
                <Disc3 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <header className="flex justify-between items-end border-b border-white/10 pb-4 mb-6 z-10 shrink-0">
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-[0.3em] ${currentTheme.terminal.textAccent} font-bold mb-1`}>Sentinel AI System v4.2.0</span>
              <h1 className="text-3xl font-light tracking-tighter text-white">Good <span className="font-medium">{time.getHours() < 12 ? 'Morning' : time.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.displayName?.split(' ')[0] || 'Director'}</span></h1>
            </div>
            <div className="flex items-center space-x-8 text-right">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-white/40">Synapse Sync</span>
                <span className="text-sm font-mono text-emerald-400">STABLE: 98.4ms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-white/40">Security Protocol</span>
                <span className={`text-sm font-mono ${currentTheme.terminal.textAccent}`}>PROTECTIVE MASK ON</span>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex space-x-4 items-center">
                <span className="text-2xl font-mono leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors">
                   <Power className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 grid grid-cols-12 gap-6 min-h-0 z-10">
            {/* LEFT COLUMN: Storage & Lounge */}
            <section className="col-span-3 flex flex-col space-y-6 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-col">
                <h2 className={`text-[11px] uppercase tracking-widest ${currentTheme.terminal.textAccent} font-bold mb-4 flex justify-between`}>
                  <span>Encrypted Cloud Drive</span>
                  <span className="text-white/40">12.8 / 100 TB</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-medium">
                      <span className="text-white/60">Visual Memories</span><span>4.2 TB</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${currentTheme.terminal.bgAccent} w-[42%]`} />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-medium">
                      <span className="text-white/60">BCI Log Data</span><span>1.8 TB</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[18%]" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-medium">
                      <span className="text-white/60">Legacy Documents</span><span>6.8 TB</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[68%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Anticipated VR Nodes</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={`aspect-square ${currentTheme.terminal.borderAccentLight} border bg-white/5 rounded flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 ${currentTheme.terminal.glowDot} rounded-full animate-pulse`} />
                    </div>
                    <div className="aspect-square bg-white/5 border border-white/10 rounded" />
                    <div className="aspect-square bg-white/5 border border-white/10 rounded" />
                    <div className="aspect-square bg-emerald-500/10 border border-emerald-500/30 rounded" />
                  </div>
                </div>
              </div>

              {/* Lounge Toggle */}
              <div 
                 onClick={() => setMode('lounge')}
                 className={`cursor-pointer transition-all border p-5 rounded-xl flex flex-col justify-between min-h-[12rem] h-auto group ${
                   mode === 'lounge' 
                     ? `${currentTheme.lounge.cardBg} ${currentTheme.lounge.cardBorder} ${currentTheme.lounge.cardShadow}`
                     : `bg-white/5 border-white/10 ${currentTheme.lounge.cardHoverBorder}`
                 }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-serif italic text-lg ${mode === 'lounge' ? currentTheme.lounge.textAccent1 : `text-white/50 group-hover:${currentTheme.lounge.textAccent2}`}`}>Luxury Lounge</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode(mode === 'lounge' ? 'jarvis' : 'lounge');
                    }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${mode === 'lounge' ? currentTheme.lounge.btnModeBorder : 'border-white/25 hover:border-white/40 text-white/50 hover:text-white'}`}
                  >
                    <div className={`w-4 h-[1px] rotate-45 ${mode === 'lounge' ? currentTheme.lounge.circleBg : 'bg-white/50'}`} />
                    <div className={`w-4 h-[1px] -rotate-45 absolute ${mode === 'lounge' ? currentTheme.lounge.circleBg : 'bg-white/50'}`} />
                  </button>
                </div>
                <p className={`text-[10px] leading-relaxed uppercase tracking-tighter mt-2 ${mode === 'lounge' ? currentTheme.lounge.textMuted : 'text-white/40'}`}>
                  AI Hibernation Active. Enter the digital sanctuary for deep-state relaxation.
                </p>

                {mode === 'lounge' ? (
                  <div className={`mt-4 pt-4 border-t ${currentTheme.lounge.borderAccent} space-y-4`} onClick={(e) => e.stopPropagation()}>
                    {/* Soundscape presets */}
                    <div className="flex flex-col space-y-1">
                      <span className={`text-[8px] uppercase tracking-wider ${currentTheme.lounge.textMuted} font-mono`}>Soundscape Presets</span>
                      <div className={`grid grid-cols-3 bg-black/40 p-1 rounded border ${currentTheme.lounge.borderAccent} gap-1`}>
                        {(['blend', 'rain', 'hum'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setAmbientSoundscape(s)}
                            className={`text-[8px] uppercase tracking-tighter py-1 rounded transition-all text-center ${
                              ambientSoundscape === s 
                                ? currentTheme.lounge.soundscapeActive 
                                : `${currentTheme.lounge.soundscapeUnselected} hover:bg-white/5`
                            }`}
                          >
                            {s === 'blend' ? 'Blend' : s === 'rain' ? 'Rain' : 'Hum'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Volume slider & mute toggle */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between items-center text-[8px] font-mono">
                        <span className={`${currentTheme.lounge.textMuted} uppercase tracking-wider`}>Atmospheric Level</span>
                        <span className={`${currentTheme.lounge.taglineText} font-bold`}>{ambientMuted ? "MUTED" : `${Math.round(ambientVolume * 100)}%`}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setAmbientMuted(!ambientMuted)}
                          className={`${currentTheme.lounge.loungeControlIcon} transition-colors p-1.5 bg-white/5 rounded border border-white/10 shrink-0`}
                          title={ambientMuted ? "Unmute Soundscape" : "Mute Soundscape"}
                        >
                          {ambientMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={ambientVolume}
                          onChange={(e) => {
                            setAmbientVolume(parseFloat(e.target.value));
                            if (ambientMuted) setAmbientMuted(false);
                          }}
                          className={`flex-1 ${currentTheme.lounge.accentSlider} bg-white/10 rounded-full h-1 cursor-pointer`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded-md mt-4 transition-colors bg-white/10 text-white/50 ${currentTheme.lounge.loungeHoverInit}`}>
                    Initialize Sanctuary
                  </button>
                )}
              </div>
            </section>

            {/* CENTER COLUMN: Core Interaction */}
            <section className="col-span-6 flex flex-col min-h-0 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
               <AnimatePresence mode="wait">
                 {mode === 'lounge' ? (
                   <motion.div 
                     key="lounge" 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }} 
                     className={`absolute inset-0 flex flex-col items-center justify-between p-12 z-20 ${currentTheme.lounge.bgGradient}`}
                   >
                     <div className="text-center">
                       <span className={`text-[10px] uppercase tracking-[0.4em] ${currentTheme.lounge.textAccent} font-bold`}>Zen Sanctuary Mode Active</span>
                       <p className="text-white/30 text-[9px] uppercase tracking-widest mt-1">Ambient synthesized soundscape running</p>
                     </div>

                     {/* Golden breathing visualizer orb */}
                     <div className="relative flex items-center justify-center py-8">
                       <motion.div 
                         animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.45, 0.15] }}
                         transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                         className={`w-48 h-48 rounded-full ${currentTheme.lounge.glowOrbColor} blur-3xl absolute`}
                       />
                       <motion.div 
                         animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
                         transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                         className={`w-32 h-32 rounded-full border ${currentTheme.lounge.glowBorderColor} flex items-center justify-center relative ${currentTheme.lounge.shadowAccent} bg-black/40`}
                       >
                         <motion.div 
                           animate={{ scale: [0.95, 1.05, 0.95] }}
                           transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                           className={`text-center font-serif italic text-lg ${currentTheme.lounge.textBright}`}
                         >
                           Breathe
                         </motion.div>
                       </motion.div>
                     </div>

                     {/* Controls and wake button */}
                     <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
                       {/* Quick controls panel */}
                       <div className={`w-full bg-black/50 border ${currentTheme.lounge.borderAccentLighter} p-4 rounded-xl flex flex-col space-y-4 shadow-lg`}>
                         <div className={`flex justify-between items-center border-b ${currentTheme.lounge.borderAccentLighter} pb-2`}>
                           <span className={`text-[9px] uppercase tracking-widest ${currentTheme.lounge.textMuted} font-bold font-mono`}>Atmosphere Preset</span>
                           <div className="flex space-x-1">
                             {(['blend', 'rain', 'hum'] as const).map((s) => (
                               <button
                                 key={s}
                                 onClick={() => setAmbientSoundscape(s)}
                                 className={`text-[9px] px-2 py-0.5 uppercase tracking-tighter rounded transition-colors ${
                                   ambientSoundscape === s ? currentTheme.lounge.soundscapeActive : `${currentTheme.lounge.soundscapeUnselected} hover:bg-white/5`
                                 }`}
                               >
                                 {s === 'blend' ? 'Blend' : s === 'rain' ? 'Rain' : 'Hum'}
                               </button>
                             ))}
                           </div>
                         </div>
                         
                         <div className="flex items-center space-x-3">
                           <button
                             onClick={() => setAmbientMuted(!ambientMuted)}
                             className={`${currentTheme.lounge.loungeActiveText} transition-colors p-2 bg-white/5 border border-white/10 rounded-full`}
                           >
                             {ambientMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                           </button>
                           <input
                             type="range"
                             min="0"
                             max="1"
                             step="0.01"
                             value={ambientVolume}
                             onChange={(e) => {
                               setAmbientVolume(parseFloat(e.target.value));
                               if (ambientMuted) setAmbientMuted(false);
                             }}
                             className={`flex-grow ${currentTheme.lounge.accentSlider} bg-white/10 rounded-full h-1 cursor-pointer`}
                           />
                           <span className={`text-[10px] font-mono ${currentTheme.lounge.taglineText} font-bold w-10 text-right`}>
                             {ambientMuted ? "MUTED" : `${Math.round(ambientVolume * 100)}%`}
                           </span>
                         </div>
                       </div>

                       <button 
                         onClick={() => setMode('jarvis')}
                         className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${currentTheme.lounge.returnBtn}`}
                       >
                         Return to Terminal / Wake J.A.R.V.I.S.
                       </button>
                     </div>
                   </motion.div>
                 ) : null}
               </AnimatePresence>
               
               <div className={`flex flex-col h-full w-full absolute inset-0 transition-opacity duration-500 z-10 bg-[#050507] ${mode === 'jarvis' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                 <CoreTerminal token={token!} userId={user?.uid} voice={voice} theme={uiTheme} />
               </div>

               <div className={`flex flex-col h-full w-full absolute inset-0 transition-opacity duration-500 z-10 bg-black ${mode === 'hologram' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                 <HologramView isActive={mode === 'hologram'} />
               </div>
            </section>

            {/* RIGHT COLUMN: Integrations & Skills */}
            <section className="col-span-3 flex flex-col space-y-6 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-1 flex flex-col min-h-[300px]">
                <h2 className={`text-[11px] uppercase tracking-widest ${currentTheme.terminal.textAccent} font-bold mb-4`}>Active Objectives</h2>
                <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none">
                   
                   <div className={`p-3 bg-white/5 border-l-2 ${currentTheme.terminal.borderAccent} rounded-r-md`}>
                     <div className={`text-[10px] ${currentTheme.terminal.textAccent} uppercase font-bold mb-1`}>Sub-Agent Orchestration</div>
                     <div className="text-xs text-white/80 leading-tight">Delegated market analysis to dynamic models...</div>
                     <div className="mt-2 text-[9px] text-white/40 font-mono">PROGRESS: 88%</div>
                   </div>

                   <div className="p-3 bg-white/5 border-l-2 border-purple-500 rounded-r-md">
                     <div className="text-[10px] text-purple-400 uppercase font-bold mb-1">Personal Security</div>
                     <div className="text-xs text-white/80 leading-tight">Deep-scanning local network and Workspace for zero-day threats.</div>
                     <div className="mt-2 text-[9px] text-white/40 font-mono">STATUS: SHIELDED</div>
                   </div>

                   <div className="p-3 bg-white/5 border-l-2 border-emerald-500 rounded-r-md">
                     <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">Decision Support</div>
                     <div className="text-xs text-white/80 leading-tight">Analyzing historical Drive data regarding Q3 roadmap.</div>
                     <div className="mt-2 text-[9px] text-white/40 font-mono">RESULT: REFINING...</div>
                   </div>

                </div>
              </div>

              {/* Theme Settings Selector */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-none">
                <h2 className={`text-[11px] uppercase tracking-[0.2em] ${currentTheme.terminal.textAccent} font-bold mb-3 flex justify-between items-center`}>
                  <span>System Color Theme</span>
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {(['midnight', 'ember', 'arctic'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setUiTheme(t)}
                      className={`cursor-pointer transition-all border text-[10px] py-2 flex flex-col items-center justify-center rounded font-bold uppercase tracking-widest ${
                        uiTheme === t
                          ? `${THEMES[t].terminal.btnActiveBg} border-current`
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[9px]">{THEMES[t].name}</span>
                      <div className="flex space-x-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${t === 'midnight' ? 'bg-indigo-500' : t === 'ember' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                        <span className={`w-2 h-2 rounded-full ${t === 'midnight' ? 'bg-cyan-500' : t === 'ember' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-none">
                <h2 className={`text-[11px] uppercase tracking-[0.2em] ${currentTheme.terminal.textAccent} font-bold mb-4`}>Sub-Agent Core Selector</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div onClick={() => setMode('jarvis')} className={`cursor-pointer transition-colors border text-[10px] py-3 flex items-center justify-center rounded font-bold uppercase tracking-tighter ${mode === 'jarvis' ? currentTheme.terminal.btnActiveBg : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10'}`}>Gemini 2.5 • Core</div>
                  <div onClick={() => setMode('hologram')} className={`cursor-pointer transition-colors border text-[10px] py-3 flex items-center justify-center rounded font-bold uppercase tracking-tighter ${mode === 'hologram' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10'}`}>Holo-Projection</div>
                  <div className="bg-white/5 border border-white/10 text-[10px] py-3 flex items-center justify-center rounded text-white/40 uppercase tracking-tighter">Claude 3.5 • Idle</div>
                  <div className="bg-white/5 border border-white/10 text-[10px] py-3 flex items-center justify-center rounded text-white/40 uppercase tracking-tighter">Llama 3 • Idle</div>
                </div>
                <div className="mt-5 text-[9px] text-center text-white/20 uppercase tracking-widest font-mono">
                  No Fees Applied - Zero Cost Mode
                </div>
              </div>
            </section>
          </main>

          {/* Footer Bar */}
          <footer className="h-12 border-t border-white/10 mt-6 flex items-center justify-between px-2 shrink-0 z-10">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.terminal.glowDot} animate-pulse`} />
                <span className={`text-[10px] uppercase font-bold tracking-widest ${currentTheme.terminal.textAccentLight}`}>Omni-Link Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Drive Encrypted</span>
              </div>
              <div className="relative group/voice">
                    <select 
                      value={voice}
                      onChange={(e) => setVoice(e.target.value as any)}
                      className={`bg-[#0f0f13] border border-white/10 text-[10px] uppercase tracking-widest text-white/80 rounded px-2.5 py-1 outline-none ${currentTheme.terminal.focusBorder} cursor-pointer hover:bg-[#1a1a24] transition-colors`}
                      title="Prebuilt Voice Persona"
                    >
                      <option value="Kore" className="bg-[#0f0f13] text-[#e0e0e0]">Kore (Premium Female - Youthful & Bright)</option>
                      <option value="Aoede" className="bg-[#0f0f13] text-[#e0e0e0]">Aoede (Premium Female - Warm & Expressive)</option>
                      <option value="Zephyr" className="bg-[#0f0f13] text-[#e0e0e0]">Zephyr (Premium Female - Soft & Balanced)</option>
                      <option value="Puck" className="bg-[#0f0f13] text-[#e0e0e0]">Puck (Male - Soft & Balanced)</option>
                      <option value="Charon" className="bg-[#0f0f13] text-[#e0e0e0]">Charon (Male - Deep & Serious)</option>
                      <option value="Fenrir" className="bg-[#0f0f13] text-[#e0e0e0]">Fenrir (Male - Rich & Dynamic)</option>
                    </select>
                </div>
            </div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.4em]">
              Advanced Core Integration • User ID: {user?.uid.substring(0,8).toUpperCase() || 'UNKNOWN'}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

// Removed standalone LoungeView as it is integrated seamlessly

const ChatInput = React.memo(({ input, setInput, handleSend, loading, isListening, currentTheme }: any) => (
  <div className="flex space-x-4 h-14 w-full">
    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className={`flex-1 bg-black/40 border border-white/10 rounded-full px-6 flex items-center space-x-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${currentTheme.terminal.focusBorder} transition-colors`}>
      <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : `${currentTheme.terminal.glowDot} animate-pulse`}`}></span>
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isListening ? "Listening..." : "Awaiting your command, Director..."}
        className="w-full h-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-white/30 text-xs font-light tracking-wide italic"
        autoFocus
      />
    </form>
    <button 
      onClick={handleSend}
      disabled={!input.trim() || loading}
      className={`disabled:opacity-50 w-14 rounded-full transition-colors flex items-center justify-center text-black ${currentTheme.terminal.bgAccent} hover:${currentTheme.terminal.bgAccentHover} disabled:${currentTheme.terminal.bgAccent} ${currentTheme.terminal.shadowGlow}`}
    >
      <Send className="w-5 h-5 -ml-0.5" />
    </button>
  </div>
));

const TeamModal = ({ assistants, selectedAssistant, setSelectedAssistant, onClose }: any) => (
  <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
    <div className="bg-[#0a0a0f] border border-white/20 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
      <h2 className="text-xl font-light text-white mb-6">Select Personal Assistant</h2>
      <div className="space-y-3">
        {assistants.map((a: any) => (
          <button
            key={a.id}
            onClick={() => { setSelectedAssistant(a); onClose(); }}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
              selectedAssistant.id === a.id
                ? 'bg-white/10 border-white/30'
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <div>
              <div className="text-sm text-white font-medium">{a.name}</div>
              <div className="text-[10px] text-white/40">{a.desc}</div>
            </div>
            <div className={`text-[9px] px-2 py-1 rounded ${a.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/30'}`}>
              {a.status}
            </div>
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-6 w-full py-3 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">Close</button>
    </div>
  </div>
);

function CoreTerminal({ token, userId, voice, theme = 'midnight' }: { token: string, userId: string, voice: string, theme?: 'midnight' | 'ember' | 'arctic' }) {

  const currentTheme = THEMES[theme];
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<{id: string, name: string, status: string}>({id: 'seraphina', name: 'Seraphina', status: 'Active'});
  const [showTeamModal, setShowTeamModal] = useState(false);
  const assistants = [
    {id: 'seraphina', name: 'Seraphina', status: 'Active', desc: 'Main Core'},
    {id: 'analyst', name: 'Data Analyst', status: 'Idle', desc: 'Market Research'},
    {id: 'researcher', name: 'Researcher', status: 'Idle', desc: 'Deep Web Search'},
    {id: 'creative', name: 'Creative', status: 'Idle', desc: 'Content Generation'}
  ];
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'updateVoice', voice }));
    }
  }, [voice]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resized = canvas.toDataURL(file.type, 0.7);
            setMessages((prev) => [...prev, { role: 'user', text: `Shared image: ${file.name}`, image: resized }]);
          };
          img.src = result;
        } else {
          setMessages((prev) => [...prev, { role: 'user', text: `Shared file: ${file.name}\nContent: ${result.substring(0, 500)}...` }]);
        }
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (focusMode) {
      interval = setInterval(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('J.A.R.V.I.S. Focus Protocol', {
            body: 'Periodic check-in: Are you maintaining your focus on the current objective?',
            icon: '/vite.svg',
          });
        }
      }, 25 * 60 * 1000); // 25 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusMode]);

  const toggleFocusMode = async () => {
    if (focusMode) {
      setFocusMode(false);
      saveMessage('model', 'Focus protocol disabled. Returning to standard monitoring.');
    } else {
      if (!('Notification' in window)) {
        saveMessage('model', 'Your device does not support desktop notifications.');
        return;
      }
      
      let perm = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }
      
      if (perm === 'granted') {
        setFocusMode(true);
        saveMessage('model', 'Focus protocol engaged. I will periodically ping you via notifications to ensure you remain on task.');
      } else {
        saveMessage('model', 'I cannot engage the Focus Protocol without notification permissions. Please grant them in your browser settings.');
      }
    }
  };

  useEffect(() => {
    if (!db || !userId) return;
    const q = query(collection(db, `users/${userId}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: any[] = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({ id: doc.id, ...doc.data() });
      });
      if (loadedMessages.length === 0) {
        setMessages([{ role: 'model', text: 'Systems initialized. Voice synthesis loaded. Secure Workspace connection established. How may I assist you today?' }]);
      } else {
        setMessages(loadedMessages as any);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const saveMessage = async (role: 'user' | 'model', text: string) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `users/${userId}/messages`), {
        role,
        text,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = async () => {
    if (!db || !userId || messages.length === 0) return;
    try {
      const q = query(collection(db, `users/${userId}/messages`));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
      setMessages([{ role: 'model', text: 'Diagnostic memory purge complete. System standing by.' }]);
    } catch (e) {
      console.error('Failed to purge memory', e);
    }
  };

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
    // Live API WebSocket state
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const animationRef = useRef<number>(0);

  const getOrCreateAudioContext = async (): Promise<AudioContext | null> => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      analyserRef.current = outputAudioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(outputAudioCtxRef.current.destination);
    } 
    
    if (outputAudioCtxRef.current.state === 'suspended') {
      await outputAudioCtxRef.current.resume().catch(e => console.error("Error resuming AudioContext:", e));
    }
    return outputAudioCtxRef.current;
  };

  const base64ToFloat32Array = (base64: string) => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
       bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
       float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  };

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const playAudioChunk = (ctx: AudioContext, base64: string) => {
    const float32Data = base64ToFloat32Array(base64);
    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    if (analyserRef.current) {
      source.connect(analyserRef.current);
    } else {
      source.connect(ctx.destination);
    }
    
    activeSourcesRef.current.add(source);
    source.onended = () => {
      activeSourcesRef.current.delete(source);
    };

    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // slight buffer
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live?token=${encodeURIComponent(token || '')}&userId=${encodeURIComponent(userId || '')}&voice=${encodeURIComponent(voice || '')}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.audio) {
        const ctx = await getOrCreateAudioContext();
        if (ctx) {
          playAudioChunk(ctx, msg.audio);
        }
      }
      if (msg.interrupted) {
        stopAllPlayback();
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed for Live API.");
    };
    
    const initAudio = () => {
      getOrCreateAudioContext();
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    return () => {
      ws.close();
      if (inputAudioCtxRef.current) {
        try {
          inputAudioCtxRef.current.close();
        } catch (e) {}
        inputAudioCtxRef.current = null;
      }
      if (outputAudioCtxRef.current) {
        try {
          outputAudioCtxRef.current.close();
        } catch (e) {}
        outputAudioCtxRef.current = null;
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      setIsListening(false);
      isListeningRef.current = false;
    };
  }, [token, userId]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !voiceEnabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let intervalId: any = null;

    const draw = () => {
      // Use requestAnimationFrame for smooth drawing when visible, but fallback to setTimeout/setInterval behavior if hidden
      // We will actually just use requestAnimationFrame when visible, and setInterval when hidden.
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = currentTheme.terminal.canvasWaveColor;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    const loop = () => {
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();

    // Fallback interval for background tab / PiP keeping it alive
    intervalId = setInterval(() => {
      if (document.hidden) {
        draw();
      }
    }, 50); // 20fps for background

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (intervalId) clearInterval(intervalId);
    };
  }, [voiceEnabled, isPipActive]);


  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        if (!videoRef.current) {
          videoRef.current = document.createElement('video');
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.addEventListener('leavepictureinpicture', () => setIsPipActive(false));
          videoRef.current.addEventListener('enterpictureinpicture', () => setIsPipActive(true));
        }

        if (canvasRef.current && !videoRef.current.srcObject) {
          // Use any to bypass TS error on captureStream if not perfectly typed
          const stream = (canvasRef.current as any).captureStream(30);
          videoRef.current.srcObject = stream;
        }

        if (videoRef.current.paused) {
          await videoRef.current.play();
        }

        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.error("PiP error:", err);
      saveMessage('model', 'Failed to initialize Picture-in-Picture. Your device or browser may block this feature, or you may need to open the app in a new tab.');
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.suspend();
      }
      saveMessage('model', 'Ambient voice protocol suspended. Returning to manual input.');
    } else {
      setIsListening(true);
      isListeningRef.current = true;
      saveMessage('model', 'Ambient voice protocol engaged. I am now listening continuously. You may minimize this window or switch to other applications; I will remain active in the background and respond to your voice via the Live API.');
      getOrCreateAudioContext();

      if (!inputAudioCtxRef.current) {
        inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
          const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
          source.connect(processor);
          processor.connect(inputAudioCtxRef.current.destination);

          processor.onaudioprocess = (e) => {
            if (!isListeningRef.current) return;

            // Block microphone input while model/TTS audio is playing to prevent feedback loop
            const isSpeaking = outputAudioCtxRef.current && 
                               outputAudioCtxRef.current.state === 'running' && 
                               outputAudioCtxRef.current.currentTime < nextStartTimeRef.current;
            if (isSpeaking) {
              return;
            }

            const inputData = e.inputBuffer.getChannelData(0);
            
            // Basic VAD (Voice Activity Detection): Only send if sound is loud enough
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += Math.abs(inputData[i]);
            }
            if (sum / inputData.length < 0.01) return; // Threshold (tweakable)

            // PCM to base64
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              let s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            const buffer = new ArrayBuffer(pcm16.length * 2);
            new Int16Array(buffer).set(pcm16);
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = window.btoa(binary);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ audio: base64 }));
            }
          };
        } catch (err) {
          console.error("Mic error:", err);
          setIsListening(false);
          isListeningRef.current = false;
          saveMessage('model', 'Microphone access denied. Please grant permission in your browser settings or try opening the application in a new tab.');
        }
      } else {
        inputAudioCtxRef.current.resume();
      }
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [currentConversationId, setCurrentConversationId] = useState<string>(() => Date.now().toString());

  const createNewChat = () => {
    setCurrentConversationId(Date.now().toString());
    setMessages([]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // Immediately halt any active voice/synthesis playbacks before initiating a new round
    stopAllPlayback();

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      await saveMessage('user', currentInput);
      
      const newMessagesForModel = [...messages, { role: 'user' as const, text: currentInput }];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', text: currentInput }], 
          accessToken: token,
          voice,
          voiceEnabled,
          assistantId: selectedAssistant.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        await saveMessage('model', data.text);
        if (data.audio && voiceEnabled) {
          const ctx = await getOrCreateAudioContext();
          if (ctx) {
            playAudioChunk(ctx, data.audio);
          }
        }
      } else {
        await saveMessage('model', `System Error: ${data.error}`);
      }
    } catch (err) {
      await saveMessage('model', 'Network failure. Unable to reach core.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col w-full max-w-5xl mx-auto h-full p-4 pb-8"
    >
      {showTeamModal && <TeamModal assistants={assistants} selectedAssistant={selectedAssistant} setSelectedAssistant={setSelectedAssistant} onClose={() => setShowTeamModal(false)} />}
      <div className="flex justify-between items-center mb-4 pr-4">
        <div className="flex items-center space-x-4 text-[9px] uppercase tracking-widest text-emerald-400/60 mr-auto pl-2 cursor-default" title="System Diagnostics & VIP Status">
          <button 
            onClick={() => setShowTeamModal(true)} 
            className="flex items-center text-white/60 hover:text-white transition-colors uppercase font-bold tracking-widest"
          >
            <UserIcon className="w-3.5 h-3.5 mr-2" />
            {selectedAssistant.name} • {selectedAssistant.status}
          </button>
        </div>
        <div className="flex space-x-2">
        <button 
          onClick={toggleFocusMode}
          title={focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
          className={`flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold ${focusMode ? 'text-emerald-400' : 'text-white/40'} hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/30 bg-transparent hover:bg-emerald-500/10 px-3 py-1.5 rounded-full`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{focusMode ? 'Focus: Active' : 'Focus: Off'}</span>
        </button>
        <button 
          onClick={createNewChat}
          title="Start fresh conversation"
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/30 bg-transparent hover:bg-emerald-500/10 px-3 py-1.5 rounded-full"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
        <button 
          onClick={clearHistory}
          title="Purge Memory"
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/30 bg-transparent hover:bg-red-500/10 px-3 py-1.5 rounded-full"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge</span>
        </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg: any, idx) => (
          <div key={msg.id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center space-x-2 mb-2 px-1">
              {msg.role === 'model' ? (
                <>
                  <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.terminal.glowDot} animate-pulse`}></div>
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${currentTheme.terminal.textAccent}`}>J.A.R.V.I.S. • Core</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">Director</span>
                </>
              )}
            </div>
            
            <div className="relative group max-w-[85%]">
              <div className={`p-4 text-sm font-light leading-relaxed relative ${
                msg.role === 'user' 
                  ? 'bg-emerald-500/10 text-emerald-50 border border-emerald-500/20 rounded-xl rounded-tr-sm' 
                  : 'bg-white/5 text-white/90 border border-white/10 rounded-xl rounded-tl-sm prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 pr-12'
              }`}>
                {msg.role === 'user' ? (
                  <>
                    <span>{msg.text}</span>
                    {msg.image && <img src={msg.image} alt="Shared" className="mt-2 rounded-lg max-w-full max-h-48" />}
                  </>
                ) : (
                  <div className="markdown-body">
                    <TypingText text={msg.text} />
                  </div>
                )}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => copyToClipboard(msg.text, idx)}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy response"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className={`text-[8px] uppercase tracking-widest text-white/30 mt-1.5 px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.createdAt)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
             <div className="flex items-center space-x-2 mb-2 px-1">
              <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.terminal.glowDot} animate-pulse`}></div>
              <span className={`text-[9px] font-bold tracking-widest uppercase ${currentTheme.terminal.textAccent}`}>J.A.R.V.I.S. • Synthesizing</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl rounded-tl-sm flex space-x-2 items-center">
              <div className={`w-1.5 h-1.5 ${currentTheme.terminal.loadingDots} rounded-full animate-loading-dots`} style={{ animationDelay: '0ms' }} />
              <div className={`w-1.5 h-1.5 ${currentTheme.terminal.loadingDots}/60 rounded-full animate-loading-dots`} style={{ animationDelay: '300ms' }} />
              <div className={`w-1.5 h-1.5 ${currentTheme.terminal.loadingDots}/30 rounded-full animate-loading-dots`} style={{ animationDelay: '600ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-none flex flex-col space-y-4 w-full">
        <div className="flex space-x-4 h-14 w-full">
          <button 
            type="button"
            onClick={async () => {
              const nextVal = !voiceEnabled;
              setVoiceEnabled(nextVal);
              if (nextVal) {
                const ctx = await getOrCreateAudioContext();
                if (ctx && ctx.state === "suspended") {
                  await ctx.resume().catch(e => console.error("Error resuming AudioContext:", e));
                }
              }
            }}
            className={`flex items-center justify-center w-14 rounded-full transition-colors border shrink-0 ${voiceEnabled ? currentTheme.terminal.voiceGlow : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
            title={voiceEnabled ? "Voice Output Enabled" : "Voice Output Muted"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {voiceEnabled && (
             <canvas ref={canvasRef} width={64} height={40} className="w-16 h-10 rounded shrink-0 self-center hidden sm:block pointer-events-none" />
          )}

          <button 
            type="button"
            onClick={togglePip}
            className={`flex items-center justify-center w-14 rounded-full transition-colors border shrink-0 hidden sm:flex ${isPipActive ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
            title={isPipActive ? "Close Mini Visualizer" : "Pop-out Mini Visualizer"}
          >
            <PictureInPicture className="w-5 h-5" />
          </button>
          
          <button 
            type="button"
            onClick={toggleListening}
            className={`flex items-center justify-center w-14 rounded-full transition-colors border shrink-0 ${isListening ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
            title={isListening ? "Listening..." : "Click to speak"}
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-14 rounded-full transition-colors border shrink-0 bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
            title="Upload file"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>

        <ChatInput input={input} setInput={setInput} handleSend={handleSend} loading={loading} isListening={isListening} currentTheme={currentTheme} />
      </div>
    </motion.div>
  );
}

function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 4));
        i += 4;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 8);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {isTyping && <SoundVisualizer isActive={isTyping} />}
    </>
  );
}
