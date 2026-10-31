import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { atsEnabled, getPool, rows } from "./db";
import type { StaffIdentity } from "./permissions";

let auth: ReturnType<typeof createAuth> | undefined;
function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Staff authentication is not configured.");
  return betterAuth({
    appName: "Sankhala recruitment",
    secret,
    baseURL: process.env.ATS_PUBLIC_ORIGIN,
    database: getPool(),
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const [staff] = await rows<{ active: number }>(
              "SELECT active FROM auth_user WHERE id=?",
              [session.userId],
            );
            return staff?.active ? { data: session } : false;
          },
        },
      },
    },
    trustedOrigins: [process.env.ATS_PUBLIC_ORIGIN ?? ""],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 14,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      modelName: "auth_user",
      additionalFields: {
        role: { type: "string", defaultValue: "recruiter", input: false },
        active: { type: "boolean", defaultValue: false, input: false },
      },
    },
    session: {
      modelName: "auth_session",
      expiresIn: 60 * 60 * 8,
      updateAge: 60 * 30,
      cookieCache: { enabled: false },
    },
    account: { modelName: "auth_account" },
    verification: { modelName: "auth_verification" },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "auth_rate_limit",
      window: 60,
      max: 40,
      customRules: { "/sign-in/email": { window: 900, max: 10 } },
    },
    advanced: {
      cookiePrefix: "sankhala",
      useSecureCookies: process.env.ATS_PUBLIC_ORIGIN?.startsWith("https://"),
      defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
    },
    disabledPaths: ["/sign-up/email"],
  });
}
export function getAuth() {
  if (!auth) auth = createAuth();
  return auth;
}
export async function currentStaff(
  requestHeaders: Headers,
): Promise<StaffIdentity | null> {
  if (!atsEnabled()) return null;
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const [staff] = await rows<{
    id: string;
    role: StaffIdentity["role"];
    active: number;
  }>("SELECT id, role, active FROM auth_user WHERE id=?", [session.user.id]);
  if (
    !staff?.active ||
    !["admin", "recruiter", "hiring_manager"].includes(staff.role)
  )
    return null;
  return { ...staff, active: true };
}
export async function requireStaff() {
  const staff = await currentStaff(await headers());
  if (!staff) redirect("/admin/login");
  return staff;
}
