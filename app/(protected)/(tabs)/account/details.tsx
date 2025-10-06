import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { Account, MoneyCents, Transaction } from '@/server/interfaces';

export function fmtMoney(cents: MoneyCents, currency = 'USD', locale = 'es-ES') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100); }
  catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
}

const nowISO = () => new Date().toISOString();
const MOCK: { accounts: Account[]; tx: Transaction[] } = {
  accounts: [
    { id: 1,balance:0, name: 'Cuenta Corriente', currency: 'USD', createdAt: nowISO(), updatedAt: nowISO() },
    { id: 2, balance:0,name: 'Caja Ahorro', currency: 'ARS', createdAt: nowISO(), updatedAt: nowISO() },
    { id: 3,balance:0, name: 'Tarjeta', currency: 'USD', createdAt: nowISO(), updatedAt: nowISO() },
  ],
  tx: [
    { id: 1, accountId: 1, type: 'IN', amountCents: 250_000, description: 'Depósito', occurredAt: nowISO(), createdAt: nowISO(), updatedAt: nowISO() },
    { id: 2, accountId: 1, type: 'OUT', amountCents: 30_500, description: 'Pago servicio', occurredAt: nowISO(), createdAt: nowISO(), updatedAt: nowISO() },
    { id: 3, accountId: 1, type: 'OUT', amountCents: 4_999, description: 'Café', occurredAt: nowISO(), createdAt: nowISO(), updatedAt: nowISO() },
  ],
};

const api = {
  async getAccountWithBalance(id: ID): Promise<AccountWithBalance | null> {
    await new Promise((r) => setTimeout(r, 200));
    const a = MOCK.accounts.find((x) => x.id === id);
    if (!a) return null;
    const balance = MOCK.tx.filter((t) => t.accountId === id).reduce((s, t) => s + (t.type === 'IN' ? t.amountCents : -t.amountCents), 0);
    return { ...a, balanceCents: balance };
  },
  async listTransactions(accountId: ID): Promise<Transaction[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK.tx
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  },
};

function TxItem({ t, currency }: { t: Transaction; currency: string }) {
  const sign = t.type === 'IN' ? '+' : '\u2212'; 
  return (
    <View style={styles.txRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle} numberOfLines={2}>{t.description}</Text>
        <Text style={styles.txSub}>{new Date(t.occurredAt).toLocaleString()}</Text>
      </View>
      <Text style={[styles.txAmount, t.type === 'OUT' && styles.txAmountOut]}>
        {sign}{fmtMoney(t.amountCents, currency)}
      </Text>
    </View>
  );
}

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [tx, setTx] = useState<Transaction[]>([]);

  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const acc = await api.getAccountWithBalance(accountId);
    setAccount(acc);
    const txs = await api.listTransactions(accountId);
    setTx(txs);
    setLoading(false);
  }, [accountId]);


  useEffect(() => { load(); }, [load]);


  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator color="#000" />
          <Text style={[styles.muted, { marginTop: 8 }]}>Cargando…</Text>
        </View>
    );
  }

  if (!account) {
    return (
        <View style={styles.center}>
          <Text style={styles.title}>Cuenta no encontrada</Text>
        </View>
    );
  }

  return (
        <FlatList
          data={tx}
          keyExtractor={(t) => String(t.id)}
          ListHeaderComponent={
            <View style={styles.headerBox}>
              <Text style={styles.title}>{account.name}</Text>
              <Text style={styles.bigAmount}>{fmtMoney(account.balance, account.currency)}</Text>
              <Text style={styles.muted}>{account.currency}</Text>
      <TouchableOpacity
        style={{
          display:"flex",
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"space-between",
          width:"100%",
          marginTop:20
        }}

        onPress={()=>{
          router.push({
            pathname:'/(protected)/(tabs)/account/transaction_new',
            params:{id:1}
          });    
        }}
      >
      <Text
        style={{
          fontSize:20,
        }}
      >
        Añadir transacción
      </Text>
        <Octicons name='plus' size={22} />
      </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={<Text style={[styles.muted, { paddingHorizontal: 24 }]}>Sin movimientos</Text>}
          renderItem={({ item }) => <TxItem t={item} currency={account.currency} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 6,
  },
  title: {
    color: '#000',
    fontSize: 28,
    fontWeight: '800',
  },
  bigAmount: {
    color: '#000',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  muted: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
  },
  txRow: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  txSub: {
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
    fontSize: 12,
  },
  txAmount: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
  },
  txAmountOut: {
    opacity: 0.75, // sutil diferenciación para OUT (sigue siendo negro)
  },
});
