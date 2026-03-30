import * as LocalAuthentication from "expo-local-authentication";

export async function canUseBiometrics() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function promptBiometricUnlock() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Prime Budget",
    cancelLabel: "Use password",
    disableDeviceFallback: false
  });

  return result.success;
}

