import { AuthProvider } from "@/utils/auth.context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(auth)" options={{
          headerShown:false
        }}/>
        <Stack.Screen name='(protected)'
        options={{
          headerShown:false,
          animation:"fade"
        }}
        />
        
      </Stack>
    </AuthProvider>
  )
}
