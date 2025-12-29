import React from "react";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isLastFinalCopy?: boolean;
  onLooksGood?: () => void;
  onTweak?: () => void;
}

/**
 * Parse and render inline bold text (**text**) as <strong> elements
 * Also handles line breaks for proper paragraph structure
 */
function renderFormattedContent(text: string) {
  // Split by double newlines to create paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIdx) => {
    // Handle single line breaks within paragraphs
    const lines = paragraph.split(/\n/);
    
    return (
      <p key={pIdx} className="mb-3 last:mb-0">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderInlineBold(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    return match ? (
      <strong key={i} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

export function MessageBubble({ 
  message, 
  isLastFinalCopy, 
  onLooksGood, 
  onTweak 
}: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end message-enter">
        <div className="max-w-[75%] md:max-w-[60%]">
          <div className="bg-chat-user text-chat-user-foreground rounded-2xl rounded-br-md px-5 py-3 text-[15px] leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex justify-start message-enter">
        <div className="max-w-[85%] md:max-w-[70%]">
          {/* Assistant bubble with improved readability */}
          <div className="bg-chat-assistant border border-chat-assistant-border rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
            <div className="assistant-content text-[15px]">
              {renderFormattedContent(message.content)}
            </div>
          </div>
          
          {/* Quick action buttons for FINAL COPY */}
          {isLastFinalCopy && (
            <div className="flex gap-2 mt-3 ml-1">
              <button
                onClick={onLooksGood}
                className="text-sm font-medium bg-accent text-accent-foreground px-4 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Looks good
              </button>
              <button
                onClick={onTweak}
                className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full hover:bg-muted transition-colors"
              >
                Tweak
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // System messages (errors, etc.)
  if (message.role === "system" && !message.checkpointPayload) {
    return (
      <div className="flex justify-center message-enter">
        <div className="max-w-[80%]">
          <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 text-sm text-center">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
