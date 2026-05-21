import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Hub — NIRA6 | Discover, Book & Collaborate with Creators",
  description: "Find photographers, videographers, editors, drone pilots, models, and studios near you. Book instant shoots, rent gear, collaborate on projects, and hire event teams.",
  keywords: "hire photographer india, book videographer, drone pilot, creator marketplace, wedding photographer, gear rental, video editor",
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
