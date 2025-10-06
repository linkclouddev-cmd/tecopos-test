import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AccountCard from '@/components/account/card';
import { Account } from '@/server/interfaces';
import { Octicons } from '@expo/vector-icons';

const api = {
  async listAccounts(): Promise<Account[]> {
    await new Promise((r) => setTimeout(r, 250));
    const now = new Date().toISOString();
    return [
      { id: 1, name: 'Cuenta Corriente', currency: 'USD', balance: 125_000, createdAt: now, updatedAt: now },
      { id: 2, name: 'Caja Ahorro', currency: 'ARS', balance: 3_000_00, createdAt: now, updatedAt: now },
      { id: 3, name: 'Tarjeta', currency: 'USD', balance: -45_670, createdAt: now, updatedAt: now },
      { id: 4, name: 'Efectivo', currency: 'USD', balance: 12_345, createdAt: now, updatedAt: now },
    ];
  },
};

export default function AccountsIndexScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.listAccounts();
    setAccounts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await api.listAccounts();
    setAccounts(data);
    setRefreshing(false);
  }, []);

  const empty = useMemo(() => accounts.length === 0, [accounts]);

  return (
      <View style={styles.container}>
      <View
        style={{
          display:"flex",
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"space-between",
          width:"100%",
          marginBottom:30
        }}
      >
      <Text
        style={{
          fontSize:30,
        }}
      >
        Cuentas
      </Text>
      <TouchableOpacity
        onPress={()=>{
          router.push('/account/new');
        }}
      >
        <Octicons name='plus' size={22} />
      </TouchableOpacity>
      </View>
        <FlatList
          data={accounts}
          keyExtractor={(a) => String(a.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, empty && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={!loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin cuentas</Text>
              <Text style={styles.emptySub}>Toca ＋ para crear tu primera cuenta</Text>
            </View>
          ) : null}
          renderItem={({ item }) => (
            <AccountCard item={item} />
          )}
        />
      </View>
  );
}

const CARD_GAP = 8;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  gridContent: { paddingBottom: 24 },
  gridRow: { gap: CARD_GAP },
  card: {
    flex: 1,
    minHeight: 150,
    borderRadius: 16,
    padding: 14,
    marginBottom: CARD_GAP,
    backgroundColor: '#fff',
  },
  cardPressed: { opacity: 0.95 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardSub: { marginTop: 6, color: '#6b7280', fontSize: 12 },
  cardAmount: { marginTop: 2, fontSize: 18, fontWeight: '800', color: '#111' },
  cardAmountNeg: { color: '#b00020' },
  addBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  addBtnText: { fontSize: 28, lineHeight: 28, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  emptySub: { marginTop: 6, color: '#6b7280' },
});
