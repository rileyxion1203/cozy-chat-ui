import React, { useState, useEffect, useRef } from "react";
import type { ServerMessage, Message } from "@/types/chat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { StatusBar } from "@/components/chat/StatusBar";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";

function generateSessionId(): string {
  return crypto.randomUUID();
}

const Index = () => {
  const [sessionId] = useState(() => generateSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastFinalCopyIndex, setLastFinalCopyIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsInitialized = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect WebSocket on mount (with StrictMode guard)
  useEffect(() => {
    if (wsInitialized.current) return;
    wsInitialized.current = true;

    const wsUrl = `ws://localhost:8000/ws?sessionId=${sessionId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;

      if (msg.type === "assistant_chunk") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && !last.checkpointId) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + msg.content },
            ];
          } else {
            return [...prev, { role: "assistant" as const, content: msg.content }];
          }
        });
      } else if (msg.type === "status") {
        setStatus(msg.content);
      } else if (msg.type === "checkpoint_required") {
        if (msg.tool === "confirm_intent" && websocket.readyState === WebSocket.OPEN) {
          websocket.send(
            JSON.stringify({
              type: "approval_response",
              sessionId,
              checkpointId: msg.checkpointId,
              decision: "approve",
            })
          );
        }
      } else if (msg.type === "done") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && last.content.includes("[FINAL COPY]")) {
            setLastFinalCopyIndex(prev.length - 1);
          }
          return prev;
        });
        setStatus(null);
      } else if (msg.type === "error") {
        setStatus(null);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error: ${msg.message}` },
        ]);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus(null);
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, [sessionId]);

  const sendMessage = (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLastFinalCopyIndex(null);

    ws.send(
      JSON.stringify({
        type: "user_message",
        sessionId,
        message: textToSend,
      })
    );
  };

  const handleLooksGood = () => {
    const endingMessage = "Glad you like it! Feel free to reach out anytime you need help with Xiaohongshu copy. Good luck with your ad!";
    setMessages((prev) => [
      ...prev,
      { role: "assistant" as const, content: endingMessage },
    ]);
    setLastFinalCopyIndex(null);
  };

  const handleTweak = () => {
    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
    inputEl?.focus();
  };

  const isConnected = ws && ws.readyState === WebSocket.OPEN;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🥔</span>
            <span className="font-semibold text-foreground">Mr.Potato</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary' : 'bg-destructive'}`} 
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Status bar */}
      {status && <StatusBar status={status} />}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((msg, idx) => {
              // Filter out confirm_intent system messages
              if (msg.role === "system" && msg.checkpointPayload?.tool === "confirm_intent") {
                return null;
              }

              return (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isLastFinalCopy={idx === lastFinalCopyIndex && msg.content.includes("[FINAL COPY]")}
                  onLooksGood={handleLooksGood}
                  onTweak={handleTweak}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage()}
        disabled={!isConnected}
      />
    </div>
  );
};

export default Index;
