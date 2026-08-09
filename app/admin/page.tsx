"use client";

import { useEffect, useState } from "react";
import { LOCATIONS, SERVICES } from "@/lib/config";
import { JobNotification } from "@/lib/notifications";

const STORAGE_KEY = "repair:admin-key";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [demo, setDemo] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [notifications, setNotifications] = useState<JobNotification[]>([]);

  // Remember the password in this browser so you're not retyping it every
  // visit. It's still sent to the server on every request to check it's
  // still valid — this is just a convenience, not a session.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdminKey(saved);
      tryUnlock(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tryUnlock(key: string) {
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { "x-admin-key": key },
      });
      if (!res.ok) {
        setAuthError("Wrong password.");
        return;
      }
      const data = await res.json();
      setUnlocked(true);
      setDemo(!!data.demo);
      setNotifications(data.notifications ?? []);
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      setAuthError("Couldn't reach the server — try again.");
    }
  }

  async function submitNotification(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    setSent(false);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          message,
          serviceName: SERVICES.find((s) => s.id === serviceId)?.name,
          locationName: LOCATIONS.find((l) => l.id === locationId)?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data?.message || "Couldn't send that.");
        return;
      }
      setNotifications((prev) => [data.notification, ...prev]);
      setMessage("");
      setServiceId("");
      setLocationId("");
      setSent(true);
    } catch {
      setSendError("Network error — try again.");
    } finally {
      setSending(false);
    }
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryUnlock(adminKey);
          }}
          className="job-ticket w-full max-w-sm p-6"
        >
          <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
            Admin
          </h1>
          <p className="mb-4 text-sm text-ink/60">
            Enter the admin password to push job notifications.
          </p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] focus:border-signal focus:outline-none"
          />
          {authError && <p className="mt-2 text-xs text-danger">{authError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-ticket bg-signal py-3 text-sm font-semibold text-white hover:bg-signalDark"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 font-display text-2xl font-semibold text-white">
          Push a job notification
        </h1>
        <p className="mb-6 text-sm text-white/50">
          Repairmen watching{" "}
          <a href="/repairmen" className="underline underline-offset-4">
            /repairmen
          </a>{" "}
          see this within a few seconds.
        </p>

        {demo && (
          <div className="mb-5 rounded-ticket border border-signal/30 bg-signal/10 px-4 py-3 text-xs text-signal">
            DEMO MODE — no <code>ADMIN_PASSWORD</code> is set, so this page is
            open to anyone with the URL. Set that environment variable before
            sharing this link.
          </div>
        )}

        <form onSubmit={submitNotification} className="job-ticket mb-8 flex flex-col gap-3 p-5">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            placeholder="e.g. New AC repair job in Lekki — first to respond gets it"
            className="w-full resize-none rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] placeholder:text-ink/40 focus:border-signal focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="rounded-ticket border border-line bg-paper px-3 py-2.5 text-sm focus:border-signal focus:outline-none"
            >
              <option value="">Service (optional)</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="rounded-ticket border border-line bg-paper px-3 py-2.5 text-sm focus:border-signal focus:outline-none"
            >
              <option value="">Location (optional)</option>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="rounded-ticket bg-signal py-3 text-sm font-semibold text-white hover:bg-signalDark disabled:cursor-not-allowed disabled:bg-ink/15"
          >
            {sending ? "Sending..." : "Push notification"}
          </button>
          {sendError && <p className="text-xs text-danger">{sendError}</p>}
          {sent && <p className="text-xs text-success">Sent to the job board.</p>}
        </form>

        <h2 className="mb-3 text-sm font-medium text-white/60">Recently sent</h2>
        <ul className="flex flex-col gap-2">
          {notifications.length === 0 && (
            <li className="text-sm text-white/40">Nothing sent yet.</li>
          )}
          {notifications.map((n) => (
            <li key={n.id} className="rounded-ticket bg-navy2 px-4 py-3 text-sm text-white/80">
              {n.message}
              {(n.serviceName || n.locationName) && (
                <div className="mt-1 text-xs text-white/40">
                  {[n.serviceName, n.locationName].filter(Boolean).join(" — ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
