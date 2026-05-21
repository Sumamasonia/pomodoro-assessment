import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // --- 1. CONFIGURATION STATE ---
  const [focusInput, setFocusInput] = useState(25); // input field values in minutes
  const [breakInput, setBreakInput] = useState(5);

  // --- 2. CORE TIMER STATE ---
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // time remaining in seconds

  // --- 3. DAILY HISTORY LOG STATE ---
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pomodoro_history');
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      const todayStr = new Date().toLocaleDateString();
      // Only retain logs that match today's date
      return parsed.filter(item => item.date === todayStr);
    } catch (e) {
      return [];
    }
  });

  // --- 4. REFS FOR ACCURATE TIMING ---
  const timerRef = useRef(null);
  const expectedEndRef = useRef(null);

  // Sync history updates to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_history', JSON.stringify(history));
  }, [history]);

  // --- 5. THE ACCURATE DRIFT-FREE COUNTDOWN ENGINE ---
  useEffect(() => {
    if (isActive) {
      // Set the absolute target timestamp in the future
      expectedEndRef.current = Date.now() + timeLeft * 1000;

      timerRef.current = setInterval(() => {
        const remainingMs = expectedEndRef.current - Date.now();
        
        if (remainingMs <= 0) {
          // Timer finished! Trigger the transition
          clearInterval(timerRef.current);
          handleCycleComplete();
        } else {
          // Update seconds left accurately
          setTimeLeft(Math.ceil(remainingMs / 1000));
        }
      }, 200); // Check frequently to keep UI tightly synced
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  // --- 6. CYCLE COMPLETION & LOGGING LOGIC ---
  const handleCycleComplete = () => {
    setIsActive(false);
    playAlarmSound();

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString();

    if (mode === 'focus') {
      // Log the completed focus session
      const durationFormatted = `${focusInput}:00`;
      const newLog = {
        id: Date.now(),
        text: `✓ ${durationFormatted} focus completed`,
        time: timeString,
        date: dateString,
      };
      setHistory(prev => [newLog, ...prev]);

      // Auto-switch to break
      setMode('break');
      setTimeLeft(breakInput * 60);
    } else {
      // Auto-switch back to focus
      setMode('focus');
      setTimeLeft(focusInput * 60);
    }
  };

  // Safe Web Audio API implementation (prevents browser context blocks)
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8); // play sound for 0.8 seconds
    } catch (e) {
      console.log("Audio playback delayed or blocked by browser security guidelines.", e);
    }
  };

  // --- 7. BUTTON CONTROLS ---
  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusInput * 60 : breakInput * 60);
  };

  const handleApplyConfig = (e) => {
    e.preventDefault();
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusInput * 60 : breakInput * 60);
  };

  // --- 8. UI FORMATTING ASSISTS ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Dynamic style changes mapping directly to app state
  const getThemeClasses = () => {
    if (!isActive && timeLeft === (mode === 'focus' ? focusInput * 60 : breakInput * 60)) {
      return 'bg-slate-900 text-slate-100'; // Default idle state
    }
    if (mode === 'focus') {
      return isActive ? 'bg-rose-950 text-rose-100' : 'bg-rose-900 text-rose-200 opacity-90';
    }
    return isActive ? 'bg-teal-950 text-teal-100' : 'bg-teal-900 text-teal-200 opacity-90';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-6 transition-colors duration-500 ${getThemeClasses()}`}>
      
      {/* Header & Configuration Form */}
      <header className="w-full max-w-md mt-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
        <form onSubmit={handleApplyConfig} className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">Focus (min)</label>
            <input 
              type="number" 
              min="1" 
              max="60"
              value={focusInput} 
              onChange={e => setFocusInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">Break (min)</label>
            <input 
              type="number" 
              min="1" 
              max="60"
              value={breakInput} 
              onChange={e => setBreakInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
          <button 
            type="submit" 
            className="col-span-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-widest py-2 rounded-lg border border-white/10"
          >
            Apply Custom Settings
          </button>
        </form>
      </header>

      {/* Main Focus Area - Center Hub */}
      <main className="flex flex-col items-center my-auto py-8">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest font-black bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            {mode === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
          </span>
          {!isActive && (
            <p className="text-sm font-medium mt-3 opacity-60 animate-pulse">Timer Paused</p>
          )}
        </div>

        {/* Scaled Readable Countdown Block */}
        <h1 className="text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-md select-none my-4">
          {formatTime(timeLeft)}
        </h1>

        {/* Clean Responsive Control Actions */}
        <div className="flex gap-4 mt-6">
          <button 
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-full text-base font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
              isActive 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-white text-slate-950 hover:bg-slate-100'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button 
            onClick={resetTimer}
            className="px-8 py-3 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-base font-bold uppercase tracking-wider active:scale-95 transition-all"
          >
            Reset
          </button>
        </div>
      </main>

      {/* Persistent Daily History Logger */}
      <footer className="w-full max-w-md mb-4 bg-black/10 backdrop-blur-sm p-5 rounded-2xl border border-white/5 shadow-inner">
        <h2 className="text-sm uppercase tracking-widest font-bold opacity-80 border-b border-white/10 pb-2 mb-3">
          Today's Activity Log
        </h2>
        
        <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-xs italic opacity-50 text-center py-4">No sessions completed yet today. Make it happen!</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="font-medium">{item.text}</span>
                <span className="text-xs opacity-60">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </footer>

    </div>
  );
}