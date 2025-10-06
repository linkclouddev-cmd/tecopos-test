import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Account, SummaryResp, Transaction } from '@/server/interfaces';
import { fmtMoney } from './account/details';

function isoRange(kind: 'MTD' | '30D' | 'YTD'): { from: string; to: string } {
  const now = new Date();
  if (kind === 'MTD') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  if (kind === 'YTD') {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  // 30D
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: now.toISOString() };
}

const MOCK = (() => {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const accounts: Account[] = [
    { id: 1,balance:100, name: 'Cuenta Corriente', currency: 'USD', createdAt: iso(now), updatedAt: iso(now) },
    { id: 2,balance:122, name: 'Caja Ahorro', currency: 'ARS', createdAt: iso(now), updatedAt: iso(now) },
  ];
  const tx: Transaction[] = [
    { id: 1, accountId: 1, type: 'IN', amountCents: 120_000, description: 'Depósito', occurredAt: iso(new Date(now.getTime() - 2*86400000)), createdAt: iso(now), updatedAt: iso(now) },
    { id: 2, accountId: 1, type: 'OUT', amountCents: 30_000, description: 'Pago', occurredAt: iso(new Date(now.getTime() - 1*86400000)), createdAt: iso(now), updatedAt: iso(now) },
    { id: 3, accountId: 2, type: 'IN', amountCents: 3_000_00, description: 'Transferencia', occurredAt: iso(new Date(now.getTime() - 10*86400000)), createdAt: iso(now), updatedAt: iso(now) },
  ];
  return { accounts, tx };
})();

const api = {
  async listAccounts(): Promise<Account[]> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK.accounts;
  },
  async summary(params: { accountId?: number; from: string; to: string }): Promise<SummaryResp> {
    await new Promise((r) => setTimeout(r, 220));
    const baseCurrency = params.accountId ? (MOCK.accounts.find(a => a.id === params.accountId)?.currency || 'USD') : 'USD';
    const inRange = MOCK.tx.filter(t => (!params.accountId || t.accountId === params.accountId) && Date.parse(t.occurredAt) >= Date.parse(params.from) && Date.parse(t.occurredAt) <= Date.parse(params.to));
    const totalIn = inRange.filter(t => t.type === 'IN').reduce((s, t) => s + t.amountCents, 0);
    const totalOut = inRange.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amountCents, 0);
    return {
      accountId: params.accountId,
      from: params.from,
      to: params.to,
      currency: baseCurrency,
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      transactions: inRange.length,
    };
  },
};

function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [range, setRange] = useState<'MTD' | '30D' | 'YTD'>('MTD');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | undefined>(undefined); 

  const { from, to } = useMemo(() => isoRange(range), [range]);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResp | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const accs = await api.listAccounts();
    setAccounts(accs);
    const s = await api.summary({ accountId, from, to });
    setSummary(s);
    setLoading(false);
  }, [accountId, from, to]);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const s = await api.summary({ accountId, from, to });
    setSummary(s);
    setRefreshing(false);
  }, [accountId, from, to]);

  const currency = summary?.currency || 'USD';

  return (

      <View  style={styles.root}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#000" />
            <Text style={[styles.muted, { marginTop: 8 }]}>Loading…</Text>
          </View>
        ) : (
          <FlatList
            data={[]}
            keyExtractor={() => 'x'}
            ListHeaderComponent={
              <View style={styles.container}>
                <View style={styles.rowWrap}>
                  <Chip label="Este mes" selected={range === 'MTD'} onPress={() => setRange('MTD')} />
                  <Chip label="Últimos 30 días" selected={range === '30D'} onPress={() => setRange('30D')} />
                  <Chip label="Hace un año" selected={range === 'YTD'} onPress={() => setRange('YTD')} />
                </View>

                <View style={[styles.rowWrap, { marginTop: 8 }]}>
                  <Chip label="Todas" selected={accountId === undefined} onPress={() => setAccountId(undefined)} />
                  {accounts.map((a) => (
                    <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
                  ))}
                </View>

                <View style={{ marginTop: 28, gap: 8 }}>
                  <Text style={styles.h1}>{fmtMoney(summary?.net || 0, currency)}</Text>
                  <Text style={styles.muted}>Neto</Text>
                </View>

                <View style={{ marginTop: 28, gap: 12 }}>
                  <View>
                    <Text style={styles.h2}>{fmtMoney(summary?.totalIn || 0, currency)}</Text>
                    <Text style={styles.muted}>Entrada</Text>
                  </View>
                  <View>
                    <Text style={styles.h2}>{fmtMoney(summary?.totalOut || 0, currency)}</Text>
                    <Text style={styles.muted}>Salida</Text>
                  </View>
                  <View>
                    <Text style={styles.h2}>{summary?.transactions ?? 0}</Text>
                    <Text style={styles.muted}>Transacciones</Text>
                  </View>
                </View>

                <View style={{ marginTop: 16 }}>
                  <Text style={styles.muted}>
                    {new Date(from).toLocaleDateString()} — {new Date(to).toLocaleDateString()}
                  </Text>
                </View>

                <View style={{ marginTop: 32 }}>
                  <Pressable onPress={() => router.replace('/account')}

                  style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                    <Text style={styles.ctaText}>Revisar mis cuentas</Text>
                  </Pressable>
                </View>
              </View>
            }
            renderItem={null}
          />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, },
  container: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { color: '#000', fontSize: 36, fontWeight: '900' },
  h2: { color: '#000', fontSize: 24, fontWeight: '800' },
  muted: { color: 'rgba(0,0,0,0.6)', fontSize: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#fff' },
  chipSelected: { backgroundColor: '#000' },
  chipText: { color: '#000', fontWeight: '700' },
  chipTextSelected: { color: '#fff' },
  link: { color: '#000', textDecorationLine: 'underline' },
  pressed: { opacity: 0.7 },
  ctaText: { color: '#000', fontSize: 20,},
});
