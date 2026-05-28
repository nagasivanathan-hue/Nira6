import type { Metadata } from 'next';
import { mockCreators } from '@/lib/creatorMockData';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { id } = await params;
  const creator = mockCreators.find(c => c.id === id) || mockCreators[0];
  
  if (!creator) {
    return {
      title: 'Creator Not Found | NIRA6',
    };
  }

  return {
    title: `${creator.name} | ${creator.title} | NIRA6`,
    description: creator.bio,
    openGraph: {
      title: `${creator.name} | ${creator.title} | NIRA6`,
      description: creator.bio,
      images: [creator.avatar],
    },
  };
}

export default function CreatorLayout({ children }: Props) {
  return <>{children}</>;
}
