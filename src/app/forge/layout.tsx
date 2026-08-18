import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Cpu, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forge Your Ideas | Custom 3D Printing & Rapid Prototyping | NIRA6',
  description: 'Turn your 3D models into reality with precision custom 3D printing, rapid prototyping, custom design services, and ready-made prints on NIRA6.',
};

export default function ForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Sub-brand Top Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-16 z-30 px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono tracking-wider text-amber-400 font-semibold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Box className="w-3.5 h-3.5" />
            <span className="uppercase">FORGE YOUR IDEAS // 3D PRINTING VERTICAL</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-700/50">
              <Cpu className="w-3 h-3 text-emerald-400" /> Fleet Status: <strong className="text-emerald-400 font-bold">100% Operational</strong>
            </span>
            <div className="flex items-center gap-3">
              <Link href="/forge" className="hover:text-amber-400 transition-colors">Overview</Link>
              <span>•</span>
              <Link href="/forge/custom" className="hover:text-amber-400 transition-colors font-bold text-amber-400">Custom Print</Link>
              <span>•</span>
              <Link href="/forge/design" className="hover:text-amber-400 transition-colors">Design Request</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative">
        {children}
      </main>

      {/* FYI Sub-brand Footer Banner */}
      <section className="border-t border-zinc-800 bg-zinc-900 py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-zinc-400 text-sm">
          <div>
            <div className="flex items-center gap-2 font-mono font-bold text-zinc-100 text-base mb-3">
              <Layers className="w-5 h-5 text-amber-400" /> FORGE YOUR IDEAS
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              Precision additive manufacturing, custom STL/3MF slicing, and professional CAD design integrated directly into NIRA6.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-zinc-200 font-semibold uppercase text-xs tracking-wider mb-3">Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/forge/custom" className="hover:text-amber-400 transition-colors">Custom STL Printing</Link></li>
              <li><Link href="/forge/design" className="hover:text-amber-400 transition-colors">CAD Design Service</Link></li>
              <li><Link href="/forge#marketplace" className="hover:text-amber-400 transition-colors">Ready-Made Shop</Link></li>
              <li><Link href="/forge/bulk" className="hover:text-amber-400 transition-colors">Enterprise & Bulk Print</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-zinc-200 font-semibold uppercase text-xs tracking-wider mb-3">Supported Formats</h4>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="bg-zinc-800 border border-zinc-700 text-amber-400 px-2 py-1 rounded">.STL</span>
              <span className="bg-zinc-800 border border-zinc-700 text-amber-400 px-2 py-1 rounded">.3MF</span>
              <span className="bg-zinc-800 border border-zinc-700 text-amber-400 px-2 py-1 rounded">.OBJ</span>
              <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded">.STEP</span>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-zinc-200 font-semibold uppercase text-xs tracking-wider mb-3">Quality Guarantee</h4>
            <p className="text-xs leading-relaxed text-zinc-400">
              Every print undergoes multi-point inspection before dispatch. If a print fails specs, we reprint free of charge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
