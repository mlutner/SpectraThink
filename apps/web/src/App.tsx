import { SignIn, useAuth } from "@clerk/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EntriesPage } from "@/pages/EntriesPage";
import { EditorPage } from "@/pages/EditorPage";
import { ProfilePage } from "@/pages/ProfilePage";

function AuthScreen() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#9b93b4",
            colorBackground: "#0f0f16",
            colorText: "#eeeaf6",
            colorTextSecondary: "#8b879e",
            colorInputBackground: "#141420",
            colorInputText: "#eeeaf6",
            borderRadius: "8px",
          },
        }}
      />
    </div>
  );
}

function SyncUser() {
  const { getToken } = useAuth();

  useEffect(() => {
    async function sync() {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silent fail — user sync is best-effort on first sign-in
      }
    }
    sync();
  }, [getToken]);

  return null;
}

export function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border2)] border-t-[var(--lavender)]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  return (
    <>
      <SyncUser />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/entries" replace />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entry/:id" element={<EditorPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/entries" replace />} />
      </Routes>
    </>
  );
}
