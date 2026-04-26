"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallbackMessage?: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    console.error("[ErrorBoundary]", error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-pink-500/40 bg-zinc-950/80 p-4 text-pink-300 shadow-[0_0_24px_rgba(236,72,153,0.35)]">
          {this.props.fallbackMessage ?? "Something failed. Please refresh and try again."}
        </div>
      );
    }

    return this.props.children;
  }
}
