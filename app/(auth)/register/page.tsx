import { SignUp } from "@clerk/nextjs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Create Account - Linksite" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "admin" || session.user.role === "owner"
        ? "/admin"
        : "/dashboard"
    );
  }

  return (
    <SignUp
      routing="hash"
      signInUrl="/login"
      fallbackRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full",
          cardBox: "w-full",
        },
      }}
    />
  );
}
