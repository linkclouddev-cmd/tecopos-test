import { Account } from "@/server/interfaces";
import { create } from "zustand";

interface AccountState {
  accounts:Account[];
  setA:(accounts:Account[]) => void;
  addA:(a:Account)=>void;
};

export const useAccounts = create<AccountState>()((set,get)=>({
  accounts:[],
  setA:(accounts) => set((state)=>({accounts})),
  addA(a) {
      const as = get().accounts;
      as.push(a);
      set((s)=>({accounts:as}));
  },
}));
