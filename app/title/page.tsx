"use client";

import { useEffect, useState } from "react";
import Logo from "../components/Logo";

export default function TitlePage() {
  const [className, setClassName] = useState("Class Name");
  const [instructorName, setInstructorName] = useState("Manas Kumar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("timer-app-data");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.className) setClassName(d.className);
        if (d.instructorName) setInstructorName(d.instructorName);
      }
    } catch {}
  }, []);

  const parts = instructorName.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white gap-8">
      <Logo className="w-48 h-auto" />
      <h1 className="text-rh text-8xl font-normal tracking-widest text-center px-12">
        {className}
      </h1>

      {/* Instructor name – bottom right */}
      <div className="absolute bottom-10 right-12 text-right">
        <span className="text-2xl font-normal text-black">{firstName}</span>
        {lastName && <span className="text-2xl font-normal text-slate-500 ml-2">{lastName}</span>}
      </div>
    </div>
  );
}

