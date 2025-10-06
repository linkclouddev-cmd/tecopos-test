import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList,StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { Account, MoneyCents, Transaction } from '@/server/interfaces';
import { useAccounts } from '@/stores/account.store';
import { g_accounts_tx } from '@/server/core.api';

export function fmtMoney(cents: MoneyCents, currency = 'USD', locale = 'es-ES') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100); }
  catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
}



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
  const acc = useAccounts().accounts;


  const load = useCallback(async () => {
    const ac = acc.find(it=>it.id === accountId);
    setAccount(ac ?? null);
    const txs = await g_accounts_tx(setLoading,accountId);
    console.log(txs.data,'tttt');
    setTx(txs as any);
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
              <Text style={styles.bigAmount}>{fmtMoney(account.amountCents, account.currency)}</Text>
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
