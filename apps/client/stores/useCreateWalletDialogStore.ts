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

interface Store extends States, Actions {}

const innitialState: States = {
  isOpen: false,
}

export const useCreateWalletDialogStore = create<Store>((set) => ({
  ...innitialState,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
}));