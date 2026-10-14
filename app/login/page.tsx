import type { Metadata } from "next";
import { AuthView } from "@/components/auth/auth-view";
import { signIn, signUp } from "./actions";

export const metadata: Metadata = {
  title: "Sign In — Wellness Hub",
};

export default function LoginPage() {
  return <AuthView signIn={signIn} signUp={signUp} />;
}
