"use client";

import { useState, type ReactNode } from "react";
import { plans } from "@/lib/content";
import { SpecularButton } from "./SpecularButton";

const NEEDS: { id: (typeof plans)[number]["id"]; label: string }[] = [
  { id: "starter", label: "A one-off build" },
  { id: "growth", label: "Steady ongoing work" },
  { id: "team", label: "A full team" },
];

/** "What do you need?" picker that spotlights the matching tier in the ladder it wraps. */
export function PlanFinder({ children }: { children: ReactNode }) {
  const [pick, setPick] = useState<string | null>(null);
  const picked = NEEDS.find((n) => n.id === pick);

  return (
    <div className="finder" data-pick={pick ?? undefined}>
      <div className="finder__bar">
        <span className="finder__q">What do you need?</span>
        <div className="pills" role="group" aria-label="What do you need?">
          {NEEDS.map((n) => (
            <SpecularButton
              key={n.id}
              type="button"
              className="pill"
              aria-pressed={pick === n.id}
              onClick={() => setPick((cur) => (cur === n.id ? null : n.id))}
            >
              {n.label}
            </SpecularButton>
          ))}
        </div>
        <span className="visually-hidden" aria-live="polite">
          {picked ? `${plans.find((p) => p.id === picked.id)?.name} is the best fit.` : ""}
        </span>
      </div>
      {children}
    </div>
  );
}
