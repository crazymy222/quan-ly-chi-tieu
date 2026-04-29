import { create } from "zustand";

interface States {
  isShow: boolean;
}

interface Actions {
  setIsShow: (isShow: boolean) => void;
  toggle: () => void;
}

type Store = States & Actions;

const innitialState: States = {
  isShow: true,
}

export const useShowBalanceStore = create<Store>((set) => ({
  ...innitialState,
  setIsShow: (isShow) => set({ isShow }),
  toggle: () => set((state) => ({ isShow: !state.isShow })),
}));