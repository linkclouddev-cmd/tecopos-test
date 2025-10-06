import { Account } from "@/server/interfaces";
import { create } from "zustand";

interface AccountState {
  accounts:Account[];
  setA:(accounts:Account[]) => void;
};

export const useAccounts = create<AccountState>()((set)=>({
  accounts:[],
  setA:(accounts) => set((state)=>({accounts}))
}));
