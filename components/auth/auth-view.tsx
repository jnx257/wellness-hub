"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";

type AuthMode = "Sign In" | "Sign Up";

type AuthActionResult = { ok: false; error: string } | void;

interface AuthViewProps {
  signIn: (input: unknown) => Promise<AuthActionResult>;
  signUp: (input: unknown) => Promise<AuthActionResult>;
}

export function AuthView({ signIn, signUp }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>("Sign In");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isSignIn = mode === "Sign In";

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password || (!isSignIn && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setPending(true);

    const action = isSignIn ? signIn : signUp;
    const result = await action({ name, birthDate, email, password });

    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="bg-bg-app flex min-h-screen items-center justify-center p-5 min-[900px]:items-stretch min-[900px]:p-0">
      <div className="bg-bg-surface shadow-auth-card w-full max-w-[400px] overflow-hidden rounded-2xl min-[900px]:flex min-[900px]:max-w-full min-[900px]:min-h-screen min-[900px]:rounded-none min-[900px]:shadow-none">
        {/* Brand side — desktop only */}
        <div className="bg-primary hidden flex-col justify-between px-[72px] py-16 min-[900px]:flex min-[900px]:flex-[1.1]">
          <div className="text-on-primary text-xl font-bold tracking-wide">Wellness Hub</div>
          <div>
            <div className="text-on-primary text-[clamp(36px,4vw,60px)] leading-[1.2] font-bold tracking-tight">
              Small steps,
              <br />
              tracked daily.
            </div>
            <div className="text-on-primary/70 mt-5 max-w-[420px] text-lg leading-relaxed">
              Goals, tasks, and journaling in one calm place.
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="bg-on-primary h-1.5 w-[22px] rounded" />
            <span className="bg-on-primary/35 h-1.5 w-1.5 rounded" />
            <span className="bg-on-primary/35 h-1.5 w-1.5 rounded" />
          </div>
        </div>

        {/* Form side */}
        <div className="flex flex-1 flex-col items-center justify-center px-[26px] pt-9 pb-8 min-[900px]:px-16 min-[900px]:py-12">
          <div className="w-full max-w-[440px]">
            <div className="text-primary mb-[30px] text-center text-base font-bold tracking-wide min-[900px]:hidden">
              Wellness Hub
            </div>

            <div className="text-headline text-primary font-bold tracking-tight">
              {isSignIn ? "Welcome back" : "Create your account"}
            </div>
            <div className="text-body-sm text-text-muted mt-1.5 mb-[26px]">
              {isSignIn
                ? "Sign in to keep your streaks going."
                : "Start tracking goals, tasks, and moods."}
            </div>

            <div className="mb-6">
              <SegmentedControl
                options={["Sign In", "Sign Up"] as const}
                value={mode}
                onChange={switchMode}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {!isSignIn && (
                <>
                  <Input
                    label="Name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mira Alvarez"
                  />
                  <Input
                    label="Birth date"
                    name="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </>
              )}

              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mira@example.com"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                labelSlot={
                  isSignIn ? (
                    <a
                      href="#"
                      className="text-text-muted hover:text-primary text-xs no-underline"
                    >
                      Forgot?
                    </a>
                  ) : undefined
                }
              />

              {error && (
                <div className="text-warning bg-warning/10 rounded-lg px-3 py-2.5 text-[12.5px]">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={pending} className="mt-1.5 w-full">
                {isSignIn ? "Sign In" : "Create Account"}
              </Button>

              <div className="my-1 flex items-center gap-2.5">
                <div className="bg-border h-px flex-1" />
                <div className="text-text-faint text-[11.5px]">or continue with</div>
                <div className="bg-border h-px flex-1" />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  className="text-body-sm border-border-accent bg-bg-surface text-text-primary hover:bg-bg-tab-track flex-1 rounded-md border py-[11px] font-semibold"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="text-body-sm border-border-accent bg-bg-surface text-text-primary hover:bg-bg-tab-track flex-1 rounded-md border py-[11px] font-semibold"
                >
                  Apple
                </button>
              </div>

              <div className="text-text-muted mt-1 text-center text-[13px]">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(isSignIn ? "Sign Up" : "Sign In")}
                  className="text-primary font-semibold"
                >
                  {isSignIn ? "Sign up" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
