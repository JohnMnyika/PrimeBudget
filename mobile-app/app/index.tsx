import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-sand">
        <ActivityIndicator size="large" color="#1D6F5F" />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}

