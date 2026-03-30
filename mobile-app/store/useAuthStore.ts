import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";
import { auth } from "@/lib/firebase";
import { upsertUserProfile, watchUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/types";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  start: () => () => void;
  setProfile: (profile: UserProfile | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  initializing: true,
  setProfile: (profile) => set({ profile }),
  start: () => {
    let unsubscribeProfile: () => void = () => {};
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        unsubscribeProfile();
        set({ user: null, profile: null, initializing: false });
        return;
      }

      await upsertUserProfile({
        userId: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "Prime Budget User",
        photoURL: user.photoURL ?? "",
        currency: "KES",
        theme: "system",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        biometricEnabled: false,
        defaultAccountId: "m-pesa-main",
        fcmTokens: []
      });

      unsubscribeProfile = watchUserProfile(user.uid, (profile) => {
        set({ user, profile, initializing: false });
      });
    });

    return () => {
      unsubscribeProfile();
      unsubscribe();
    };
  }
}));
