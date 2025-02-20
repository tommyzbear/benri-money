import { create } from "zustand";

export type HeaderType = "balance" | "balance-sm" | "profile" | "";

type HeaderState = {
    type: HeaderType;
    setHeaderType: (type: HeaderType) => void;
};

const defaultHeader = {
    type: "balance-sm" as HeaderType,
};

export const useHeaderStore = create<HeaderState>((set) => ({
    ...defaultHeader,
    setHeaderType: (type: HeaderType) => set({ type }),
}));
