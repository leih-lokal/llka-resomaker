"use client";

import { createContext, useContext, ReactNode } from "react";
import type { AppConfig } from "@/lib/config/types";

const ConfigContext = createContext<AppConfig | null>(null);

interface ConfigProviderProps {
  config: AppConfig;
  children: ReactNode;
}

export function ConfigProvider({ config, children }: ConfigProviderProps) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useConfig(): AppConfig {
  const context = useContext(ConfigContext);
  if (context === null) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
