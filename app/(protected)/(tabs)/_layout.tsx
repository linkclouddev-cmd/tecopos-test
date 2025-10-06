import { Tabs } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <SafeAreaView style={{flex:1}} edges={["top"]}>
    <View style={{flex:1,paddingTop:10}}>
    <KeyboardAvoidingView enabled
    behavior={Platform.OS === "ios" ? 'padding' : undefined} 
    style={{flex:1
    }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
        })],
        tabBarShowLabel:false,
        tabBarActiveTintColor:"#000",
        tabBarInactiveTintColor:"gray",
        tabBarBackground: () => (
          Platform.OS === "ios" 
            ? (
          <BlurView
            intensity={80}
            tint="light"
            style={{ flex: 1 }}
          />
            ) : (<View style={{flex:1,backgroundColor:"#fff"}}></View>)

    ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title:"Home",
          tabBarIcon: ({ color }) => <Octicons size={25} name="home" color={color} />,
        }}

      />
      <Tabs.Screen
        name="account"
        options={{
          title:"Account",
          tabBarIcon: ({ color }) => <Octicons size={25} name="credit-card" color={color} />,
        }}
      />
    </Tabs>
    </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor:"transparent"
  },
});
