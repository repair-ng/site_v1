"use client";

import { useEffect, useRef, useState } from "react";
import { buildJobClaimMessage, buildWhatsAppLink } from "@/lib/config";
import { JobNotification } from "@/lib/notifications";

const POLL_MS = 6000;

export default function RepairmenPage() {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const knownIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifyPermission("unsupported");
      return;
    }
    setNotifyPermission(Notification.permission);
  }, []);

  function requestNotifyPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(setNotifyPermission);
  }

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;

        const incoming: JobNotification[] = data.notifications ?? [];

        // Fire a browser notification for anything new, once we've loaded
        // the initial list (so the first page load doesn't fire a burst).
        if (!firstLoad.current) {
          const fresh = incoming.filter((n) => !knownIds.current.has(n.id));
          if (fresh.length > 0 && notifyPermission === "granted") {
            fresh.forEach((n) => {
              new Notification("New RE-PAIR job available", {
                body: n.message,
                tag: n.id,
              });
            });
          }
        }

        incoming.forEach((n) => knownIds.current.add(n.id));
        setNotifications(incoming);
        firstLoad.current = false;
        setLoading(false);
      } catch {
        // Silently retry on the next interval — a dropped poll isn't worth
        // alarming a repairman over.
      }
    }

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyPermission]);

  return (
    <main className="min-h-screen bg-navy px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal font-display text-lg font-bold text-white">
            R
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            RE-PAIR — Job board
          </span>
        </div>

        {notifyPermission !== "granted" && notifyPermission !== "unsupported" && (
          <button
            type="button"
            onClick={requestNotifyPermission}
            className="mb-4 w-full rounded-ticket border border-teal/40 bg-teal/10 px-4 py-3 text-left text-sm text-teal hover:bg-teal/15"
          >
            Turn on notifications so you don&apos;t miss a job while this tab
            is open →
          </button>
        )}

        <div className="job-ticket p-5">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold text-navy">
              Available jobs
            </h1>
            <span className="ticket-number text-xs text-ink/40">
              {loading ? "loading..." : `${notifications.length} listed`}
            </span>
          </div>

          {!loading && notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-ink/50">
              No jobs posted yet — this page checks for new ones every few
              seconds, so just leave it open.
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {notifications.map((n) => (
              <JobCard key={n.id} notification={n} />
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          This page checks for new jobs automatically — no need to refresh.
        </p>
      </div>
    </main>
  );
}

function JobCard({ notification }: { notification: JobNotification }) {
  const summary = [notification.serviceName, notification.locationName]
    .filter(Boolean)
    .join(" — ");
  const claimMessage = buildJobClaimMessage({
    jobId: notification.id,
    summary: summary || notification.message,
  });

  return (
    <li className="rounded-ticket border border-line bg-paper px-4 py-3">
      <div className="mb-1 flex flex-wrap gap-1.5">
        {notification.serviceName && (
          <Tag>{notification.serviceName}</Tag>
        )}
        {notification.locationName && (
          <Tag tone="teal">{notification.locationName}</Tag>
        )}
      </div>
      <p className="text-sm text-ink">{notification.message}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-ink/40">
          {timeAgo(notification.createdAt)}
        </span>
        <a
          href={buildWhatsAppLink(claimMessage)}
          target="_blank"
          rel="noreferrer"
          className="rounded-ticket bg-signal px-3 py-1.5 text-xs font-semibold text-white hover:bg-signalDark"
        >
          I&apos;ll take this job
        </a>
      </div>
    </li>
  );
}

function Tag({ children, tone = "signal" }: { children: React.ReactNode; tone?: "signal" | "teal" }) {
  const cls = tone === "teal" ? "bg-teal/10 text-teal" : "bg-signal/10 text-signal";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
