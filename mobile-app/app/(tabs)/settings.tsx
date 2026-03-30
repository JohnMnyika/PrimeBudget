import { useState } from "react";
import { Alert, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { canUseBiometrics, promptBiometricUnlock } from "@/hooks/useBiometrics";
import { signOutUser } from "@/lib/auth";
import { upsertUserProfile } from "@/lib/firestore";
import { PillButton, Screen, SectionCard } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";

export default function SettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [currency, setCurrency] = useState(profile?.currency ?? "KES");
  const [theme, setTheme] = useState(profile?.theme ?? "system");
  const [biometricEnabled, setBiometricEnabled] = useState(profile?.biometricEnabled ?? false);

  if (!profile) {
    return null;
  }
  const activeProfile = profile;

  async function saveSettings() {
    const nextProfile = {
      ...activeProfile,
      currency: currency as typeof activeProfile.currency,
      theme: theme as typeof activeProfile.theme,
      biometricEnabled
    };
    await upsertUserProfile(nextProfile);
    Alert.alert("Saved", "Your settings have been updated.");
  }

  async function enableBiometrics() {
    const supported = await canUseBiometrics();
    if (!supported) {
      Alert.alert("Unavailable", "Biometric login is not available on this device.");
      return;
    }
    const success = await promptBiometricUnlock();
    if (!success) {
      Alert.alert("Verification failed", "Try again to enable biometric login.");
      return;
    }
    setBiometricEnabled(true);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-ink">Settings</Text>
        <Text className="mt-2 text-base text-steel">Manage profile, appearance, biometrics, and everyday defaults.</Text>

        <SectionCard className="mt-6">
          <Text className="text-lg font-semibold text-slate">Profile</Text>
          <View className="mt-4 gap-3">
            <TextInput className="rounded-2xl bg-sand px-4 py-4" value={activeProfile.displayName} editable={false} />
            <TextInput className="rounded-2xl bg-sand px-4 py-4" value={activeProfile.email} editable={false} />
          </View>
        </SectionCard>

        <SectionCard className="mt-5">
          <Text className="text-lg font-semibold text-slate">Preferences</Text>
          <View className="mt-4 gap-3">
            <TextInput
              className="rounded-2xl bg-sand px-4 py-4"
              value={currency}
              onChangeText={(value) => setCurrency(value as typeof activeProfile.currency)}
              placeholder="KES"
            />
            <TextInput
              className="rounded-2xl bg-sand px-4 py-4"
              value={theme}
              onChangeText={(value) => setTheme(value as typeof activeProfile.theme)}
              placeholder="system"
            />
            <View className="flex-row items-center justify-between rounded-2xl bg-sand px-4 py-4">
              <Text className="text-base text-slate">Biometric login</Text>
              <Switch value={biometricEnabled} onValueChange={(value) => (value ? enableBiometrics() : setBiometricEnabled(false))} />
            </View>
          </View>
          <View className="mt-4 gap-3">
            <PillButton label="Save settings" onPress={saveSettings} />
            <PillButton label="Sign out" onPress={() => signOutUser()} variant="ghost" />
          </View>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}
