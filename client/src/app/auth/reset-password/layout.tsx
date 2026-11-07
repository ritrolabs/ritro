import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password | Ritro",
  description: "Choose a new password for your Ritro account.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
