import { SignIn } from "@clerk/nextjs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign In - Linksite" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "admin" || session.user.role === "owner"
        ? "/admin"
        : "/dashboard"
    );
  }

  return (
    <SignIn
      routing="hash"
      signUpUrl="/register"
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
