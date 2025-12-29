import React from "react";

interface StatusBarProps {
  status: string;
}

export function StatusBar({ status }: StatusBarProps) {
  return (
    <div className="bg-chat-status border-b border-border px-4 py-2.5 flex items-center gap-2">
      {/* Animated typing indicator */}
      <div className="flex gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-sm text-chat-status-foreground font-medium">
        {status}
      </span>
    </div>
  );
}
