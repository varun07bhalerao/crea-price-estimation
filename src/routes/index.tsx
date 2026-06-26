import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creā Space — Pricing Console" },
      { name: "description", content: "Internal pricing & estimation console for Creā Space digital agency." },
    ],
  }),
  component: Index,
});

function Shell() {
  const { authed } = useAuth();
  return authed ? <Dashboard /> : <LoginScreen />;
}

function Index() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
