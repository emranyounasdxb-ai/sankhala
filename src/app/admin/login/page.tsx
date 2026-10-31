import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/ats/login-form";
import { currentStaff } from "@/lib/ats/auth";
import { atsEnabled } from "@/lib/ats/db";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (atsEnabled() && (await currentStaff(await headers())))
    redirect("/admin?tab=overview");
  return <LoginForm enabled={atsEnabled()} />;
}
