import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Account, MoneyCents, Transaction, TxType } from '@/server/interfaces';
import { Input } from '@/components/global/input';
const nowISO = () => new Date().toISOString();
const isIsoDate = (d?: string) => (d ? !isNaN(Date.parse(d)) : false);

function fmtMoney(cents: MoneyCents, currency = 'USD', locale = 'es-ES') {
try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100); }
catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
}

const MOCK: { accounts: Account[]; tx: Transaction[] } = {
  accounts: [
    { id: 1,balance:100.4, name: 'Cuenta Corriente', currency: 'USD', createdAt: nowISO(), updatedAt: nowISO() },
    { id: 2,balance:47.6, name: 'Caja Ahorro', currency: 'ARS', createdAt: nowISO(), updatedAt: nowISO() },
  ],
  tx: [],
};
const api = {
  async getAccount(id: number): Promise<Account | null> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK.accounts.find((a) => a.id === id) ?? null;
  },
  async createTransaction(p: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    await new Promise((r) => setTimeout(r, 250));
    const id = (MOCK.tx.at(-1)?.id ?? 0) + 1;
    const now = nowISO();
    const tx: Transaction = { ...p, id, createdAt: now, updatedAt: now };
    MOCK.tx.push(tx);
    return tx;
  },
};
function TypeToggle({ value, onChange }: { value: TxType; onChange: (t: TxType) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Pressable onPress={() => onChange('IN')} style={({ pressed }) => [styles.toggleBtn, value === 'IN' && styles.toggleSelected, pressed && styles.pressed]}>
        <Text style={[styles.toggleText, value === 'IN' && styles.toggleTextSelected]}>
          Entrada
        </Text>
      </Pressable>
      <Pressable onPress={() => onChange('OUT')} style={({ pressed }) => [styles.toggleBtn, value === 'OUT' && styles.toggleSelected, pressed && styles.pressed]}>
        <Text style={[styles.toggleText, value === 'OUT' && styles.toggleTextSelected]}>
          Salida
        </Text>
      </Pressable>
    </View>
  );
}

export default function NewTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<TxType>('IN');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const a = await api.getAccount(accountId);
      setAccount(a);
      setLoading(false);
    })();
  }, [accountId]);
function centsFromDecimalString(v: string): number | null {
if (!v) return null;
const cleaned = v.replace(/[^0-9,\.]/g, '').replace(',', '.');
if (!cleaned) return null;
const num = Number(cleaned);
if (!isFinite(num) || num <= 0) return null;
return Math.round(num * 100);
}
  const v = useMemo(() => {
    const errs: string[] = [];
    const cents = centsFromDecimalString(amount);
    if (!account?.id) errs.push('No es una cuenta válida');
    if (cents === null || cents <= 0) errs.push('Cantidad inválida');
    if (!description.trim()) errs.push('Descripción obligatoria');
    if (occurredAt && !isIsoDate(occurredAt)) errs.push('Fecha invalida');
    return { ok: errs.length === 0, cents: cents ?? 0, errs };
  }, [account?.id, amount, description, occurredAt]);

  const submit = useCallback(async () => {
    Keyboard.dismiss();
    if (!v.ok || saving || !account) return;
    setSaving(true);
    setError(null);
    try {
      const tx = await api.createTransaction({
        accountId: account.id,
        type,
        amountCents: v.cents,
        description: description.trim(),
        occurredAt: occurredAt || nowISO(),
      });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Could not create transaction');
    } finally {
      setSaving(false);
    }
  }, [v.ok, saving, account, type, description, occurredAt, router]);

  if (loading) {
    return (
        <View style={styles.center}> 
          <ActivityIndicator color="#000" />
          <Text style={[styles.muted, { marginTop: 8 }]}>Loading…</Text>
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Cuenta</Text>
            <Text style={styles.title}>{account.name}</Text>
            <Text style={styles.muted}>{account.currency}</Text>
          </View>

          <View style={{ gap: 8, marginTop: 24 }}>
            <Text style={styles.label}>Tipo</Text>
            <TypeToggle value={type} onChange={setType} />
          </View>

          <View style={{ gap: 8, marginTop: 24 }}>
            <Text style={styles.label}>Cantidad ({account.currency})</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(0,0,0,0.35)"
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
            {!!amount && (
              <Text style={styles.preview}>= {fmtMoney(centsFromDecimalString(amount) ?? 0, account.currency)}</Text>
          
            )}
          </View>

          <View style={{ gap: 8, marginTop: 24 }}>
            <Text style={styles.label}>Descripción</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Describa el motivo de su transacción"
              placeholderTextColor="rgba(0,0,0,0.35)"
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>

          <View style={{ gap: 8, marginTop: 24 }}>
            <Text style={styles.label}>Realizada el (opcional, ISO)</Text>
            <Input
              value={occurredAt}
              onChangeText={setOccurredAt}
              placeholder="2025-10-06T12:34:00Z"
              placeholderTextColor="rgba(0,0,0,0.35)"
              autoCapitalize="none"
            />
            <Pressable onPress={() => setOccurredAt(nowISO())}>
              {({ pressed }) => <Text style={[styles.link, pressed && styles.pressed]}>
                    Usar tiempo actual
                </Text>}
            </Pressable>
          </View>

          {(!v.ok || error) && (
            <View style={{ marginTop: 24 }}>
              {v.errs.map((e, i) => (
                <Text key={i} style={styles.muted}>• {e}</Text>
              ))}
              {error ? <Text style={styles.muted}>• {error}</Text> : null}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={submit}
            disabled={!v.ok || saving}
            style={({ pressed }) => [styles.button, (!v.ok || saving) && styles.buttonDisabled, pressed && styles.pressed]}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create transaction</Text>}
          </Pressable>
        </ScrollView>
        </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#000', fontSize: 28, fontWeight: '800' },
  label: { color: 'rgba(0,0,0,0.6)', fontSize: 14 },
  muted: { color: 'rgba(0,0,0,0.6)', fontSize: 14 },
  input: {
    color: '#000',
    fontSize: 18,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 11 }),
  },
  preview: { color: 'rgba(0,0,0,0.6)', fontSize: 12 },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#fff' },
  toggleSelected: { backgroundColor: '#000' },
  toggleText: { color: '#000', fontSize: 16, fontWeight: '700' },
  toggleTextSelected: { color: '#fff' },
  button: { marginTop: 32, backgroundColor: '#000',
    borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor:"gray" },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  link: { color: '#000', textDecorationLine: 'underline', marginTop: 6 },
  pressed: { opacity: 0.7 },
});
