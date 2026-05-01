import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { AuthProvider } from "@/components/common/AuthProvider";

export const metadata: Metadata = {
  title: "Letscode",
  description:
    "A collaborative coding platform made for students, faculties and interviewers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-neutral`}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
