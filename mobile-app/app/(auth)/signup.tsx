import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { signUpWithEmail } from "@/lib/auth";
import { PillButton, Screen, SectionCard } from "@/components/ui";

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await signUpWithEmail(email, password, displayName);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Sign-up failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen>
      <View className="mt-8 flex-1 justify-center">
        <Text className="text-4xl font-black text-ink">Create account</Text>
        <Text className="mt-3 text-base text-steel">Set up your profile and start planning with real-time Firebase sync.</Text>

        <SectionCard className="mt-8 bg-white">
          <View className="gap-4">
            <TextInput className="rounded-2xl bg-sand px-4 py-4" placeholder="Full name" value={displayName} onChangeText={setDisplayName} />
            <TextInput
              className="rounded-2xl bg-sand px-4 py-4"
              placeholder="Email address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput className="rounded-2xl bg-sand px-4 py-4" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <PillButton label="Create account" onPress={handleSignup} />
          </View>
        </SectionCard>

        <Link href="/(auth)/login" asChild>
          <Text className="mt-6 text-center text-sm text-jade">Already have an account? Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}

