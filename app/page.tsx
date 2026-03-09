"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, SkipForward, Settings, Plus, Trash2 } from "lucide-react";

interface Timer {
  id: string;
  duration: number; // in seconds
  name: string;
}

interface AppData {
  className: string;
  instructorName: string;
  timers: Timer[];
}

export default function Home() {
  const [data, setData] = useState<AppData>({
    className: "Class Name",
    instructorName: "Manas Kumar",
    timers: [],
  });
  
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        if (d.timers && d.timers.length > 0) {
          setTimeLeft(d.timers[0].duration);
        }
      })
      .catch(() => {});
  }, []);

  const currentTimer = data.timers && data.timers[currentTimerIndex] ? data.timers[currentTimerIndex] : null;
  const isFinished = data.timers && data.timers.length > 0 && currentTimerIndex >= data.timers.length;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (currentTimerIndex < data.timers.length - 1) {
        const nextIndex = currentTimerIndex + 1;
        setCurrentTimerIndex(nextIndex);
        setTimeLeft(data.timers[nextIndex].duration);
      } else {
        setCurrentTimerIndex(data.timers.length);
        setIsRunning(false);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, currentTimerIndex, data.timers]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTimerIndex(0);
    setTimeLeft(data.timers && data.timers[0]?.duration ? data.timers[0].duration : 0);
  };
  const skipTimer = () => {
    if (currentTimerIndex < data.timers.length - 1) {
      const nextIndex = currentTimerIndex + 1;
      setCurrentTimerIndex(nextIndex);
      setTimeLeft(data.timers[nextIndex].duration);
    } else {
      setIsRunning(false);
      setCurrentTimerIndex(data.timers.length);
      setTimeLeft(0);
    }
  };

  const updateData = (newData: AppData) => {
    setData(newData);
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
  };

  const handleTimerChange = (index: number, field: keyof Timer, value: string | number) => {
    const newTimers = [...data.timers];
    newTimers[index] = { ...newTimers[index], [field]: value };
    updateData({ ...data, timers: newTimers });
  };

  const handleAddTimer = () => {
    const newTimers = [...(data.timers || []), { id: crypto.randomUUID(), duration: 60, name: "New Timer" }];
    updateData({ ...data, timers: newTimers });
    if (newTimers.length === 1) setTimeLeft(60);
  };

  const handleDeleteTimer = (index: number) => {
    const newTimers = data.timers.filter((_, i) => i !== index);
    updateData({ ...data, timers: newTimers });
    if (currentTimerIndex === index) {
      resetTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 220;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const maxDuration = currentTimer?.duration || 1;
  const strokeDashoffset = circumference - ((maxDuration - timeLeft) / maxDuration) * circumference;

  const instructorParts = (data.instructorName || "Manas Kumar").trim().split(" ");
  const firstName = instructorParts[0] || "";
  const lastName = instructorParts.slice(1).join(" ") || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-800 font-sans font-light relative tracking-wide">
      <div className="absolute top-10 left-12 text-3xl font-light tracking-tight text-red-500">
        {data.className}
      </div>

      <div className="absolute bottom-10 right-12 text-xl font-light text-slate-400">
        Instructor: <span className="text-black font-medium">{firstName}</span>{" "}
        <span className="text-slate-600 font-light">{lastName}</span>
      </div>

      <div className="flex w-full max-w-7xl justify-center items-center gap-24 px-8">
        
        <div className="flex flex-col items-center flex-1">
          <div className="text-lg font-medium mb-10 text-red-500 uppercase tracking-[0.25em] h-8">
            {isFinished ? "Session Complete" : currentTimer?.name || "No Timers"}
          </div>

          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#ef4444"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset, transition: "stroke-dashoffset 1s linear" }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute text-8xl font-extralight tabular-nums tracking-tighter text-slate-900">
              {formatTime(timeLeft)}
            </div>
          </div>

          {data.timers && data.timers.length > 0 && !isFinished && (
            <div className="flex gap-8 mt-16 items-center">
              <button 
                onClick={resetTimer} 
                className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-slate-100 transition duration-300"
              >
                <Square size={20} className="fill-current" />
              </button>
              <button 
                onClick={toggleTimer} 
                className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 hover:-translate-y-1 hover:bg-red-600 transition-all duration-300"
              >
                {isRunning ? <Pause size={36} className="fill-current" /> : <Play size={36} className="ml-2 fill-current" />}
              </button>
              <button 
                onClick={skipTimer} 
                className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-slate-100 transition duration-300"
              >
                <SkipForward size={22} className="fill-current" />
              </button>
            </div>
          )}
          {isFinished && (
             <button onClick={resetTimer} className="mt-16 px-10 py-4 rounded-full bg-red-500 text-white font-normal uppercase tracking-wider hover:bg-red-600 transition shadow-xl shadow-red-500/20">
                Restart Session
             </button>
          )}
        </div>

        <div className="w-[420px] flex flex-col bg-slate-50/50 backdrop-blur-sm border border-slate-100/80 p-8 rounded-3xl h-[650px] shadow-2xl shadow-slate-200/50 relative overflow-y-auto">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light tracking-wide text-slate-800">Sequence</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 hover:text-red-500 transition duration-300 transform hover:rotate-90">
                 <Settings size={22} />
              </button>
           </div>
           
           {isEditing && (
             <div className="flex flex-col gap-5 mb-8 pb-8 border-b border-slate-200/60">
               <div>
                 <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Class Name</label>
                 <input 
                   value={data.className}
                   onChange={(e) => updateData({...data, className: e.target.value})}
                   className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-red-400 focus:ring-4 focus:ring-red-50 outline-none transition-all font-light" 
                 />
               </div>
               <div>
                 <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Instructor Name</label>
                 <input 
                   value={data.instructorName}
                   onChange={(e) => updateData({...data, instructorName: e.target.value})}
                   className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-red-400 focus:ring-4 focus:ring-red-50 outline-none transition-all font-light"
                 />
               </div>
             </div>
           )}

           <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
             {data.timers && data.timers.length === 0 && (
                <div className="text-center text-slate-400 mt-10 font-light">No segments added yet.</div>
             )}
             {data.timers && data.timers.map((t, idx) => (
                <div key={t.id || idx} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
                  idx === currentTimerIndex && !isFinished 
                    ? "border-red-200 bg-red-50/50 shadow-sm shadow-red-100/50" 
                    : isEditing ? "border-slate-200 bg-white hover:border-slate-300" : "border-transparent bg-white shadow-sm opacity-90 hover:opacity-100"
                }`}>
                  {isEditing ? (
                    <div className="flex gap-3 items-center">
                      <input 
                        value={t.name}
                        onChange={(e) => handleTimerChange(idx, "name", e.target.value)}
                        className="flex-1 w-0 text-base font-light p-1 outline-none border-b border-slate-200 focus:border-red-400 bg-transparent transition-colors"
                      />
                      <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <input 
                          type="number"
                          value={Math.floor(t.duration / 60)}
                          onChange={(e) => handleTimerChange(idx, "duration", (parseInt(e.target.value) || 0) * 60 + (t.duration % 60))}
                          className="w-10 text-center font-light outline-none bg-transparent text-slate-700"
                          min="0"
                        /> <span className="text-xs text-slate-400">m</span>
                        <input 
                          type="number"
                          value={t.duration % 60}
                          onChange={(e) => handleTimerChange(idx, "duration", Math.floor(t.duration / 60) * 60 + (parseInt(e.target.value) || 0))}
                          className="w-10 text-center font-light outline-none bg-transparent text-slate-700"
                          min="0" max="59"
                        /> <span className="text-xs text-slate-400">s</span>
                      </div>
                      <button onClick={() => handleDeleteTimer(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center group">
                       <span className={`font-light text-lg tracking-wide ${idx === currentTimerIndex && !isFinished ? "text-red-500" : "text-slate-600"}`}>{t.name}</span>
                       <span className={`tabular-nums font-light text-lg ${idx === currentTimerIndex && !isFinished ? "text-red-500" : "text-slate-400"}`}>{formatTime(t.duration)}</span>
                    </div>
                  )}
                </div>
             ))}
           </div>

           {isEditing && (
             <button 
               onClick={handleAddTimer}
               className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-dashed border-slate-300 text-slate-500 hover:border-red-400 hover:text-red-500 hover:bg-red-50/50 transition-all font-light"
             >
               <Plus size={20} /> Add Segment
             </button>
           )}
        </div>

      </div>
    </div>
  );
}


