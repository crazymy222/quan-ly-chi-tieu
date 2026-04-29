import { create } from "zustand";

interface States {
  isOpen: boolean;
}

interface Actions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

type Store = States & Actions;

const innitialState: States = {
  isOpen: false,
}

export const useTransactionHistoryDialogStore = create<Store>((set) => ({
  ...innitialState,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
