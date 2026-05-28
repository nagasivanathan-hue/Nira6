'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-nira-gray text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ⚠️
        </div>
        <h2 className="font-heading font-black text-2xl text-nira-dark mb-4">Something went wrong!</h2>
        <p className="text-nira-text-secondary text-sm mb-8">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-3 bg-nira-dark text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 px-4 py-3 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
