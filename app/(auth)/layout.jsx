import { ClerkProvider } from "@clerk/nextjs";
import { inter } from "next/font/google";
export const metadata = {
  title: "URL-SHORTNER",
  description: "A URLShortner web page",
};
const inter = inter({ Subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <ClerkProvider>
      <html>
        <body className={`${inter.className}bg-dark-1`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
