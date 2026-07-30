export interface Theme {
  background: string;
  border: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
}

export const themes: Record<string, Theme> = {
  default: {
    background: "#191414",
    border: "#2a2a2a",
    primaryText: "#ffffff",
    secondaryText: "#b3b3b3",
    accent: "#1db954",
  },
  light: {
    background: "#ffffff",
    border: "#e5e5e5",
    primaryText: "#191414",
    secondaryText: "#666666",
    accent: "#1db954",
  },
  dracula: {
    background: "#282a36",
    border: "#44475a",
    primaryText: "#f8f8f2",
    secondaryText: "#a0a4c4",
    accent: "#ff79c6",
  },
  ocean: {
    background: "#0f172a",
    border: "#1e293b",
    primaryText: "#e2e8f0",
    secondaryText: "#94a3b8",
    accent: "#38bdf8",
  },
  midnight: {
    background: "#0d0d0d",
    border: "#262626",
    primaryText: "#f5f5f5",
    secondaryText: "#8c8c8c",
    accent: "#f5a623",
  },
};

export function resolveTheme(name?: string | string[]): Theme {
  const key = Array.isArray(name) ? name[0] : name;
  return themes[key ?? "default"] ?? themes.default;
}
