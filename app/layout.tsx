import "./globals.css";
import { Footer } from "@/Components/Footer";
import { Navbar } from "../Components/Navbar";
import { Sidebar } from "@/Components/Sidebar";
export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <Sidebar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
