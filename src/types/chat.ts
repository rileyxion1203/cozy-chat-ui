// Message types
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  checkpointId?: string;
  checkpointPayload?: CheckpointPayload;
};

// Server message types
export type ServerMessage = 
  | { 
      type: "assistant_chunk"; 
      sessionId: string; 
      content: string; 
    }
  | { 
      type: "status"; 
      sessionId: string; 
      content: string; 
    }
  | { 
      type: "checkpoint_required"; 
      sessionId: string; 
      checkpointId: string; 
      tool: "confirm_intent" | "final_review"; 
      payload: CheckpointPayload; 
    }
  | { 
      type: "done"; 
      sessionId: string; 
    }
  | { 
      type: "error"; 
      sessionId: string; 
      message: string; 
    };

// Checkpoint payload types
export type CheckpointPayload = 
  | { 
      tool: "confirm_intent"; 
      product: string; 
      benefits: string[]; 
      tone: string; 
      audience?: string; 
      optionalHint?: string; 
    }
  | { 
      tool: "final_review"; 
      title: string; 
      content: string; 
    };
