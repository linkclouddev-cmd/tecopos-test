import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AccountCard from '@/components/account/card';
import { Octicons } from '@expo/vector-icons';
import { useAccounts } from '@/stores/account.store';
import { g_accounts } from '@/server/core.api';


export default function AccountsIndexScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const accounts = useAccounts().accounts;

  const load = useCallback(async () => {
    await getd();
  }, []);

  const {setA} = useAccounts();
  async function getd(){
      const {data} = await g_accounts(setLoading);
      setA(data ?? []);
      return data as any;
  };

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    await getd();
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
          ) : (
            <View style={styles.emptyState}>
              <ActivityIndicator size={30} />
            </View>
          )}
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
