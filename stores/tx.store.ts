import { Transaction } from "@/server/interfaces";
import { create } from "zustand";

interface TransactionsState {
  txs:Transaction[];
  addT:(tx:Transaction) => void;
  addManyT:(txs:Transaction[]) => void;
};

export const useAccounts = create<TransactionsState>()((set)=>({
  txs:[],
  addT(tx) {
    set((st)=>({txs:[...st.txs,tx]}));
  },
  addManyT(txs) {
    set((st)=>({txs:[...st.txs,...txs]}));
  },
}));
