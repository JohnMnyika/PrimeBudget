import "@/global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export default function RootLayout() {
  const start = useAuthStore((state) => state.start);
  const user = useAuthStore((state) => state.user);
  const bootstrap = useFinanceStore((state) => state.bootstrap);
  const subscribe = useFinanceStore((state) => state.subscribe);

  useEffect(() => {
    const unsubscribe = start();
    return unsubscribe;
  }, [start]);

  useEffect(() => {
    bootstrap().catch(console.error);
  }, [bootstrap]);

  useEffect(() => {
    if (!user) {
      return;
    }
    return subscribe(user.uid);
  }, [subscribe, user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

