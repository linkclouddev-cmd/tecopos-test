import { AuthContext } from "@/utils/auth.context";
import { useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const isEmail = (v: string) => /.+@.+\..+/.test(v.trim());
const nonEmpty = (v: string) => v.trim().length > 0;

const Login = ({
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  const router = useRouter();

  const loading = false;
  const error = localError ?? undefined;

  const validation = useMemo(() => {
    const idOk = isEmail(identifier) || nonEmpty(identifier); 
    const passOk = password.length >= 6;
    return {
      idOk,
      passOk,
      canSubmit: idOk && passOk,
      idMsg: idOk ? undefined : "Ingresa un usuario o email válido",
      passMsg: passOk ? undefined : "La contraseña debe tener al menos 6 caracteres",
    };
  }, [identifier, password]);

  async function onSubmit(){
    await auth.log_in();
    router.replace("/(protected)/(tabs)");
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validation.canSubmit || loading) return;

    setLocalError(null);
    if (!onSubmit) {
      try {
        setSubmitting(true);
      } catch (e: any) {
        setLocalError(e?.message ?? "Algo salió mal");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit();
    } catch (e: any) {
      setLocalError(e?.message ?? "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={{ width: "100%" }}>
              <Text style={styles.greet}>
                Hola de nuevo
              </Text>
              <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Usuario o Email</Text>
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="demo@demo.com o demo"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="username"
                  style={styles.input}
                  returnKeyType="next"
                />
                {validation.idMsg ? <Text style={styles.errorText}>{validation.idMsg}</Text> : null}
              </View>

              <View style={styles.field}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Contraseña</Text>
                  <Pressable onPress={() => setShowPass((s) => !s)}>
                    <Text style={styles.link}>{showPass ? "Ocultar" : "Mostrar"}</Text>
                  </Pressable>
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  textContentType="password"
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                {validation.passMsg ? <Text style={styles.errorText}>{validation.passMsg}</Text> : null}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleSubmit}
                disabled={!validation.canSubmit || loading}
                style={[
                  styles.button,
                  (!validation.canSubmit || loading) && styles.buttonDisabled,
                ]}
              >
                {
                  loading ? 
                    <ActivityIndicator /> : 
                    <Text style={styles.buttonText}>Entrar</Text>
                }
              </TouchableOpacity>

            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ¿No tienes cuenta?{" "}
                <Text onPress={()=>{
                  router.replace('/(auth)/register');
                }} style={styles.link}>
                  Regístrate
                </Text>
              </Text>
            </View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-end",
    gap: 20,
    flex: 1,
  },
  greet: {
    fontFamily: "Roboto",
    color: "#000",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: "#555",
    fontSize: 14,
  },
  form: {
    marginTop: 16,
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#333",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 11 }),
    fontSize: 16,
    color: "#000",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bbb",
  },
  checkboxChecked: {
    backgroundColor: "#000",
  },
  rememberLabel: {
    color: "#333",
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#ffb3b3",
    backgroundColor: "#ffecec",
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "#c00404",
    fontSize: 13,
  },
  button: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    color: "#000",
    textDecorationLine: "underline",
  },
  helper: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
  },
  helperStrong: {
    color: "#000",
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#444",
  },
});

export default Login;
