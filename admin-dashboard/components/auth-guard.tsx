"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

export function AuthGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminEmails = useMemo(
    () => (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()),
    []
  );

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, (user) => {
      const email = user?.email?.toLowerCase();
      setAllowed(Boolean(email && adminEmails.includes(email)));
      setLoading(false);
    });
  }, [adminEmails]);

  async function signIn() {
    await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-parchment text-obsidian">Loading admin workspace...</div>;
  }

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#dff8ef,_#f6f1e8_55%)] p-6">
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl shadow-emerald-950/10">
          <p className="text-xs uppercase tracking-[0.35em] text-tide">Prime Budget Admin</p>
          <h1 className="mt-3 text-4xl font-black text-obsidian">Secure access only</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Sign in with an approved Google account listed in <code>NEXT_PUBLIC_ADMIN_EMAILS</code>.
          </p>
          <button className="mt-8 w-full rounded-full bg-tide px-5 py-3 font-semibold text-white" onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
