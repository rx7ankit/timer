"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import Logo from "./components/Logo";


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
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [isEditingInstructor, setIsEditingInstructor] = useState(false);
  const [newSegment, setNewSegment] = useState({ name: '', minutes: 1, active: false });
  const [editingTimer, setEditingTimer] = useState<{ idx: number; field: 'name' | 'minutes' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('timer-app-data');
      if (saved) {
        const d: AppData = JSON.parse(saved);
        setData(d);
        if (d.timers && d.timers.length > 0) setTimeLeft(d.timers[0].duration);
      }
    } catch {}
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
    localStorage.setItem('timer-app-data', JSON.stringify(newData));
  };

  const handleTimerChange = (index: number, field: keyof Timer, value: string | number) => {
    const newTimers = [...data.timers];
    newTimers[index] = { ...newTimers[index], [field]: value };
    updateData({ ...data, timers: newTimers });
  };

  const saveNewSegment = () => {
    if (!newSegment.name.trim() || newSegment.minutes <= 0) {
      setNewSegment({ name: '', minutes: 1, active: false });
      return;
    }
    const duration = newSegment.minutes * 60;
    const newTimers = [...(data.timers || []), { id: crypto.randomUUID(), duration, name: newSegment.name }];
    updateData({ ...data, timers: newTimers });
    if (newTimers.length === 1 && !isRunning) setTimeLeft(duration);
    setNewSegment({ name: '', minutes: 1, active: false });
  };

  const handleDeleteTimer = (index: number) => {
    const newTimers = data.timers.filter((_, i) => i !== index);
    updateData({ ...data, timers: newTimers });
    if (currentTimerIndex === index) {
      resetTimer();
    }
  };

  const saveEditingTimer = (idx: number, field: 'name' | 'minutes', value: string) => {
    const newTimers = [...data.timers];
    if (field === 'name') {
      if (value.trim()) newTimers[idx] = { ...newTimers[idx], name: value.trim() };
    } else {
      const mins = parseInt(value);
      if (mins > 0) newTimers[idx] = { ...newTimers[idx], duration: mins * 60 };
    }
    updateData({ ...data, timers: newTimers });
    setEditingTimer(null);
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

      {/* Top Left: Logo + Class Name */}
      <div className="absolute top-8 left-10 flex items-center gap-3">
        <Logo className="h-8 w-auto" />
        <div className="group flex items-center gap-2">
          {isEditingClass ? (
            <input
              autoFocus
              value={data.className}
              onChange={(e) => setData({ ...data, className: e.target.value })}
              onBlur={() => { setIsEditingClass(false); updateData(data); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingClass(false); updateData(data); } }}
              className="text-2xl font-light tracking-tight text-rh bg-transparent border-b border-rh/40 outline-none w-72 pb-1"
            />
          ) : (
            <span
              onClick={() => setIsEditingClass(true)}
              className="text-2xl font-light tracking-tight text-rh cursor-text"
            >{data.className}</span>
          )}
        </div>
      </div>

      {/* Bottom Right: Instructor Name – click to edit */}
      <div className="absolute bottom-10 right-12">
        {isEditingInstructor ? (
          <input
            autoFocus
            value={data.instructorName}
            onChange={(e) => setData({ ...data, instructorName: e.target.value })}
            onBlur={() => { setIsEditingInstructor(false); updateData(data); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingInstructor(false); updateData(data); } }}
            className="text-xl font-light bg-transparent border-b border-slate-300 outline-none text-right w-48 pb-1 text-slate-700"
          />
        ) : (
          <span
            onClick={() => setIsEditingInstructor(true)}
            className="cursor-text"
          >
            <span className="text-xl font-medium text-black">{firstName}</span>
            {lastName && <span className="text-xl font-light text-slate-500 ml-1">{lastName}</span>}
          </span>
        )}
      </div>

      <div className="flex w-full max-w-7xl justify-center items-center gap-24 px-8">

        {/* BIG TIMER */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-lg font-medium mb-10 text-rh uppercase tracking-[0.25em] h-8">
            {isFinished ? "Session Complete" : currentTimer?.name || "No Timers"}
          </div>

          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle stroke="#f1f5f9" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle
                stroke="#EE0000"
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

          {/* Start / Pause – small text-only pill below circle */}
          {data.timers && data.timers.length > 0 && !isFinished && (
            <button
              onClick={toggleTimer}
              className="mt-10 px-12 py-2.5 rounded-xl bg-black text-white text-sm font-medium tracking-widest uppercase hover:scale-[1.02] active:scale-[0.97] transition-transform duration-200"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
          )}

          {isFinished && (
            <button onClick={resetTimer} className="mt-16 px-10 py-4 rounded-full bg-black text-white font-normal uppercase tracking-wider hover:bg-slate-800 transition">
              Restart Session
            </button>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-[560px] flex flex-col p-6 h-[650px]">

          {/* Scrollable list with fade masks */}
          <div className="relative flex-1 min-h-0">
            {/* top fade */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 z-10"
              style={{ background: 'linear-gradient(to bottom, white 0%, transparent 100%)' }} />
            {/* bottom fade */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 z-10"
              style={{ background: 'linear-gradient(to top, white 0%, transparent 100%)' }} />

            <div className="h-full overflow-y-auto flex flex-col justify-center gap-3 py-8"
              style={{ scrollbarWidth: 'none' }}>
              {data.timers && data.timers.length === 0 && !newSegment.active && (
                <div className="text-center text-slate-400 font-light">No sequences added yet.</div>
              )}

            {data.timers && data.timers.map((t, idx) => {
              const status = (isFinished || idx < currentTimerIndex) ? 'done'
                : idx === currentTimerIndex ? 'active'
                : 'pending';
              const rowCls = status === 'done'
                ? 'border-green-200 bg-green-50/60'
                : status === 'active'
                ? 'border-amber-200 bg-amber-50/60'
                : 'border-slate-100 bg-slate-50';
              const nameCls = status === 'done' ? 'text-green-700'
                : status === 'active' ? 'text-amber-700'
                : 'text-slate-600';
              const minCls = status === 'done' ? 'text-green-500'
                : status === 'active' ? 'text-amber-500'
                : 'text-slate-400';

              return (
                <div
                  key={t.id || idx}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 group ${rowCls}`}
                >
                  {/* Name – click to edit */}
                  {editingTimer?.idx === idx && editingTimer.field === 'name' ? (
                    <input
                      autoFocus
                      defaultValue={t.name}
                      onBlur={(e) => saveEditingTimer(idx, 'name', e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditingTimer(idx, 'name', e.currentTarget.value); if (e.key === 'Escape') setEditingTimer(null); }}
                      className={`flex-1 font-light text-lg bg-transparent outline-none border-b border-current pb-0.5 ${nameCls}`}
                    />
                  ) : (
                    <span
                      onClick={() => !isRunning && setEditingTimer({ idx, field: 'name' })}
                      className={`font-light text-lg tracking-wide flex-1 ${nameCls} ${!isRunning ? 'cursor-text' : ''}`}
                    >{t.name}</span>
                  )}

                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {/* Minutes – click to edit */}
                    {editingTimer?.idx === idx && editingTimer.field === 'minutes' ? (
                      <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        defaultValue={String(Math.ceil(t.duration / 60))}
                        onBlur={(e) => saveEditingTimer(idx, 'minutes', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditingTimer(idx, 'minutes', e.currentTarget.value); if (e.key === 'Escape') setEditingTimer(null); }}
                        onChange={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                        className={`w-10 text-center tabular-nums font-light bg-transparent outline-none border-b border-current pb-0.5 ${minCls}`}
                      />
                    ) : (
                      <span
                        onClick={() => !isRunning && setEditingTimer({ idx, field: 'minutes' })}
                        className={`tabular-nums font-light ${minCls} ${!isRunning ? 'cursor-text' : ''}`}
                      >{Math.ceil(t.duration / 60)} min</span>
                    )}

                    {!isRunning && (
                      <button
                        onClick={() => handleDeleteTimer(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rh rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Segment – smoothly hides when running */}
            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{ maxHeight: isRunning ? '0px' : '120px', opacity: isRunning ? 0 : 1 }}
            >
              {!newSegment.active ? (
                <button
                  onClick={() => setNewSegment({ name: '', minutes: 1, active: true })}
                  className="mt-1 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-rh/40 hover:text-rh hover:bg-red-50/40 transition-all font-light"
                >
                  <Plus size={18} /> Add Sequence
                </button>
              ) : (
                <div className="animate-scale-in mt-1 flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-red-300 bg-red-50/40">
                  <input
                    autoFocus
                    placeholder="Segment title…"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveNewSegment(); }}
                    className="flex-1 w-0 text-base font-light p-1 outline-none border-b border-red-200 focus:border-red-400 bg-transparent placeholder-red-300 text-red-700"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={newSegment.minutes === 0 ? "" : String(newSegment.minutes)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                      setNewSegment({ ...newSegment, minutes: val === "" ? 0 : parseInt(val) });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveNewSegment(); }}
                    placeholder="min"
                    className="w-12 text-center font-light outline-none bg-white border border-red-200 rounded-lg px-1 py-1.5 text-slate-700 placeholder-slate-300"
                  />
                  <button
                    onClick={saveNewSegment}
                    className="p-1.5 text-white bg-black rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Check size={18} />
                  </button>
                </div>
              )}
            </div>
            </div>{/* end scroll container */}
          </div>{/* end relative fade wrapper */}
        </div>{/* end sidebar */}

      </div>
    </div>
  );
}


