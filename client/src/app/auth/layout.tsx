import type { Metadata } from "next";

// The sign-in page is a client component, so its title and description live here
export const metadata: Metadata = {
  title: "Log in | Ritro",
  description: "Log in to Ritro, or start your archive. Free and open source.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
