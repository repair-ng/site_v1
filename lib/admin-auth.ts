// ---------------------------------------------------------------------------
// A deliberately simple gate for the admin page: one shared password, kept
// in the ADMIN_PASSWORD environment variable and sent back as a header on
// every admin request.
//
// This is fine to start with but isn't real authentication — anyone with
// the password has full access, and the password itself sits in plain text
// in whatever's asking for it. If you outgrow this, swap it for a proper
// auth provider (Clerk, Auth.js, Supabase Auth) and check a logged-in
// session instead of a shared secret.
//
// If ADMIN_PASSWORD isn't set, the admin page runs in DEMO MODE (no
// password required) so you can try it immediately — set a real password
// before this is reachable by anyone but you.
// ---------------------------------------------------------------------------

export function checkAdminAuth(providedKey: string | null): {
  ok: boolean;
  demo: boolean;
} {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { ok: true, demo: true };
  }
  return { ok: providedKey === expected, demo: false };
}
