import { AuthContext } from "@/utils/auth.context";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";

export default function ProtectedLayout() {
  const auth = useContext(AuthContext);
  if(!auth.is_logged) {
    return <Redirect href={'/login'} />
  };
  return (
  <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
  </Stack>
  );
}
