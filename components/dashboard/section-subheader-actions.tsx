"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function SectionSubheaderActions({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("section-subheader-actions"));
  }, []);

  return target ? createPortal(children, target) : null;
}
