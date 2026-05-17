import Link from 'next/link';
import { Camera, Mail, MapPin, Globe, Video } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
  ],
  Services: [
    { label: 'Buy Equipment', href: '/buy' },
    { label: 'Sell Your Gear', href: '/sell' },
    { label: 'Rent Equipment', href: '/rent' },
    { label: 'Repair Services', href: '/repair' },
    { label: 'Creator Services', href: '/services' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Warranty', href: '/warranty' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { Icon: Camera, href: '#', label: 'Instagram' },
  { Icon: Globe, href: '#', label: 'Facebook' },
  { Icon: Video, href: '#', label: 'YouTube' },
  { Icon: Globe, href: '#', label: 'Website' },
];

export default function Footer() {
  return (
    <footer className="bg-nira-dark text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-xl mb-1">Stay in the loop</h3>
              <p className="text-white/60 text-sm">Get the latest deals, creator tips, and platform updates.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 bg-white/10 rounded-xl text-sm border border-white/10 focus:border-nira-yellow focus:outline-none placeholder:text-white/40"
              />
              <button className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-nira-yellow rounded-xl flex items-center justify-center font-heading font-black text-nira-dark text-lg">N6</div>
              <span className="font-heading font-bold text-xl">NIRA6</span>
            </Link>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">
              India&apos;s premium AI-powered recommerce platform for creators and tech enthusiasts.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-nira-yellow hover:text-nira-dark transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm mb-4 text-white/80">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/50 hover:text-nira-yellow text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-sm">
            <p>&copy; {new Date().getFullYear()} NIRA6. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Madurai, India</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> nira6studio@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
