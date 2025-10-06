import { Stack } from "expo-router";

export default function AccountLayout(){
  return (
    <Stack>
      <Stack.Screen
      options={{
        headerShown:false
      }}
      name='index' />
      <Stack.Screen
      options={{
        presentation:"modal",
        headerShown:false
      }}
      name='details' />
      <Stack.Screen
      options={{
        presentation:"modal",
        headerShown:false
      }}
      name='new' />
      <Stack.Screen
      options={{
        presentation:"modal",
        headerShown:false
      }}
      name='transaction_new' />
    </Stack>
  )
};
