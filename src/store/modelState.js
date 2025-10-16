import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export const useModelState = create((set) => ({
  showLevelTableModel: false,
}));
