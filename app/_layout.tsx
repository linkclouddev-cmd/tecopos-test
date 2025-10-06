import { AuthProvider } from "@/utils/auth.context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack></Stack>
    </AuthProvider>
  )
}
