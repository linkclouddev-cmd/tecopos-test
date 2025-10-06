export type ID = number;
export type MoneyCents = number; 


export type TxType = 'IN' | 'OUT';

export interface User {
  id: ID;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: ID;
  name: string;
  currency: string; 
  balance:number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: ID;
  accountId: ID;
  type: TxType;            
  amountCents: MoneyCents;  
  description: string;
  occurredAt: string;       
  createdAt: string;        
  updatedAt: string;      
}

export interface AccountWithBalance extends Account {
  balanceCents: MoneyCents;
}


export interface RegisterReq {
  name: string;              
  email: string;             
  password: string;          
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface AccountReq {
  name: string;
  currency: string;         
}

export interface TxCreateReq {
  accountId: ID;
  type: TxType;             
  amountCents: MoneyCents;
  description: string;
  occurredAt?: string;       
}

export interface SummaryResp {
  accountId?: ID;             
  from: string;               
  to: string;                 
  currency: string;           
  totalIn: MoneyCents;
  totalOut: MoneyCents;
  net: MoneyCents;
  transactions: number;
}
