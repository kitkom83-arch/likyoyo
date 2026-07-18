"use client";

import { createContext, useContext } from "react";

export type SectionCollapseContextValue = {
  isCollapsed: (id: string) => boolean;
  toggle: (id: string) => void;
  register: (id: string) => void;
};

export const SectionCollapseContext =
  createContext<SectionCollapseContextValue | null>(null);

export const useSectionCollapse = (): SectionCollapseContextValue | null =>
  useContext(SectionCollapseContext);
