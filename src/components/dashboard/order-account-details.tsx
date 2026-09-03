"use client";

import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderAccountDetailsProps {
  orderId: string;
  canEdit: boolean;
}

export function OrderAccountDetails({
  orderId,
  canEdit,
}: OrderAccountDetailsProps) {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${orderId}/credentials`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load account detail state.");
        return response.json() as Promise<{ hasCredentials?: boolean }>;
      })
      .then((payload) => {
        if (active) setHasCredentials(Boolean(payload.hasCredentials));
      })
      .catch(() => {
        if (active) setMessage("Unable to load secure account details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  async function reveal() {
    setMessage(null);
    const response = await fetch(`/api/orders/${orderId}/credentials?reveal=1`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      credentials?: { accountEmail: string; password: string } | null;
      error?: string;
    };

    if (!response.ok || !payload.credentials) {
      setMessage(payload.error || "No saved credentials are available.");
      return;
    }

    setAccountEmail(payload.credentials.accountEmail);
    setPassword(payload.credentials.password);
    setRevealed(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || saving) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountEmail, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to save account details.");

      setHasCredentials(true);
      setRevealed(false);
      setAccountEmail("");
      setPassword("");
      setMessage("Account details saved securely.");
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : "Unable to save account details.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {loading ? (
        <p className="py-2 text-[10px] text-[#667069]">Loading secure details…</p>
      ) : (
        <>
          {hasCredentials && !revealed ? (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <p className="text-[11px] font-semibold text-[#F4F7F5]">
                Credentials saved
              </p>
              <button
                type="button"
                onClick={reveal}
                className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] px-3 text-[10px] font-semibold text-[#A0AAA4] hover:bg-white/[0.03] hover:text-[#F4F7F5]"
              >
                <Eye className="mr-1.5 size-3.5" />
                Reveal
              </button>
            </div>
          ) : null}

          {canEdit && (!hasCredentials || revealed) ? (
            <form onSubmit={save} className="mt-2 space-y-3">
              <label className="block">
                <span className="text-[10px] text-[#667069]">Game account email</span>
                <input
                  type="email"
                  required
                  maxLength={320}
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                  autoComplete="off"
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 text-xs text-[#F4F7F5] outline-none focus:border-blue-300/[0.18]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#667069]">Password</span>
                <div className="relative mt-1.5">
                  <input
                    type={revealed ? "text" : "password"}
                    required
                    maxLength={256}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 pr-10 text-xs text-[#F4F7F5] outline-none focus:border-blue-300/[0.18]"
                  />
                  {revealed ? (
                    <EyeOff className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667069]" />
                  ) : null}
                </div>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg bg-[#39E56F] px-3 text-[10px] font-semibold text-[#050807] hover:bg-[#20C95A] disabled:opacity-50"
              >
                <Save className="mr-1.5 size-3.5" />
                {saving ? "Saving…" : hasCredentials ? "Update securely" : "Save securely"}
              </button>
            </form>
          ) : null}

          {!canEdit && hasCredentials && revealed ? (
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-[10px] text-[#667069]">Game account email</p>
                <p className="mt-1 break-all text-xs text-[#F4F7F5]">{accountEmail}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#667069]">Password</p>
                <p className="mt-1 break-all font-mono text-xs text-[#F4F7F5]">{password}</p>
              </div>
            </div>
          ) : null}
        </>
      )}

      {message ? (
        <p className="mt-3 text-[10px] leading-4 text-[#A0AAA4]">{message}</p>
      ) : null}

      <p className="mt-2 text-[9px] leading-4 text-[#667069]">
        Encrypted and only accessible to you and your assigned booster.
      </p>
    </div>
  );
}
