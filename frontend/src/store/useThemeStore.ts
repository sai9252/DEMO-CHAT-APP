import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat_theme") || "coffee",
    setTheme: (theme: any) => {
        localStorage.setItem("chat-theme", theme);
            set({ theme });
    },
}));