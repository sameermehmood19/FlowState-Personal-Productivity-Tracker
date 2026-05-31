"use client";

import React, { useState } from "react";
import { FlowBotDrawer } from "./FlowBotDrawer";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlowBotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FlowBotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        id="flowbot-btn"
        aria-label="Open FlowBot AI Chat"
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-2xl gradient-brand",
          "flex items-center justify-center",
          "shadow-lg shadow-indigo-500/30",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40",
          "active:scale-95",
          isOpen && "scale-95 opacity-90"
        )}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl animate-pulse-glow pointer-events-none" />

        {isOpen ? (
          <Bot className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            {/* "AI" badge */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </>
        )}
      </button>
    </>
  );
}
