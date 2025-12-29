import React from "react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl">🥔</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        Ask Mr.Potato
      </h1>
      <p className="text-muted-foreground text-[15px] max-w-sm leading-relaxed">
        Create compliant, culturally-adapted RedNote ad copy
      </p>
    </div>
  );
}
