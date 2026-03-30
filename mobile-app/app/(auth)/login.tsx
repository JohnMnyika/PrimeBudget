import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { PillButton, Screen, SectionCard } from "@/components/ui";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin() {
    try {
      await signInWithEmail(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Google sign-in failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen>
      <View className="mt-8 flex-1 justify-center">
        <Text className="text-4xl font-black text-ink">Prime Budget</Text>
        <Text className="mt-3 text-base leading-6 text-steel">
          A polished fintech planner for budgets, goals, M-Pesa, alerts, and AI-powered money insights.
        </Text>

        <SectionCard className="mt-8 bg-white">
          <Text className="text-2xl font-bold text-ink">Welcome back</Text>
          <View className="mt-5 gap-4">
            <TextInput
              className="rounded-2xl bg-sand px-4 py-4"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="rounded-2xl bg-sand px-4 py-4"
              secureTextEntry
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
            />
            <PillButton label="Sign in" onPress={handleEmailLogin} />
            <PillButton label="Continue with Google" onPress={handleGoogleLogin} variant="secondary" />
          </View>
        </SectionCard>

        <Link href="/(auth)/signup" asChild>
          <Text className="mt-6 text-center text-sm text-jade">New here? Create your account</Text>
        </Link>
      </View>
    </Screen>
  );
}

