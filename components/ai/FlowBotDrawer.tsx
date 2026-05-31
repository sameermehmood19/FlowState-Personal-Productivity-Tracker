"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatBubble } from "./ChatBubble";
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Why is my productivity score dropping?",
  "What should I focus on studying today?",
  "Am I ready to start my first project?",
  "Give me a short pep talk — I'm demotivated.",
  "What does my mood trend say about me?",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm **FlowBot**, your AI mentor inside FlowState 👋\n\nI can see your study logs, learning coach progress, and project blueprints — so my advice is specific to **your** situation, not generic tips.\n\nWhat would you like to explore?",
};

interface FlowBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlowBotDrawer({ isOpen, onClose }: FlowBotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add empty loading bubble that we'll fill incrementally
    const loadingId = "loading-" + Date.now();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "" },
    ]);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome" && m.content.trim().length > 0)
        .slice(-8) // last 8 messages (4 exchanges) for context window
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to get response");
      }

      // Stream the response incrementally
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        // Update message content as chunks arrive
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId ? { ...m, content: accumulated } : m
          )
        );
      }

      // Finalise with any remaining bytes
      const remaining = decoder.decode();
      if (remaining) {
        accumulated += remaining;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId ? { ...m, content: accumulated } : m
          )
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: "❌ " + (err?.message || "Connection error. Please check your network and try again.") }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 flex flex-col",
          "bg-white dark:bg-slate-900",
          "border-l border-slate-100 dark:border-slate-800",
          "shadow-2xl shadow-black/20",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">FlowBot</h2>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                AI Mentor · Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isLoading={msg.id.startsWith("loading-") && isLoading}
            />
          ))}
        </div>

        {/* Suggested questions (shown when only welcome message) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 space-y-1.5 flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Try asking...
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-2 rounded-lg transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your productivity..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none leading-relaxed max-h-32 disabled:opacity-50"
              style={{ height: "auto" }}
              onInput={(e) => {
                const ta = e.target as HTMLTextAreaElement;
                ta.style.height = "auto";
                ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                input.trim() && !isLoading
                  ? "gradient-brand text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            FlowBot reads your logs & coach data for personalized answers
          </p>
        </div>
      </div>
    </>
  );
}
