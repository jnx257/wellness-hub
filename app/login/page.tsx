import type { Metadata } from "next";
import { AuthView } from "@/components/auth/auth-view";

export const metadata: Metadata = {
  title: "Sign In — Wellness Hub",
};

export default function LoginPage() {
  // TODO: wire onSubmit to a server action once the auth backend exists.
  return <AuthView />;
}
