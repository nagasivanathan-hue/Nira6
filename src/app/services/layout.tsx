import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hire Creative Services | NIRA6',
  description: 'Find and hire top-rated photographers, videographers, and editors for your next project.',
  openGraph: {
    title: 'Hire Creative Services | NIRA6',
    description: 'Find and hire top-rated photographers, videographers, and editors for your next project.',
    type: 'website',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
