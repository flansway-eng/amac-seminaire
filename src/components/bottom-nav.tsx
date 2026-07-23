'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, GitCompare, MessageSquare } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Textes',
      href: '/textes',
      icon: BookOpen,
    },
    {
      name: 'Ma section',
      href: '/ma-section',
      icon: Users,
    },
    {
      name: 'Concordance',
      href: '/concordance',
      icon: GitCompare,
    },
    {
      name: 'Séminaire',
      href: '/seminaire',
      icon: MessageSquare,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-4 flex items-center justify-around md:max-w-md md:mx-auto md:rounded-t-2xl md:border-x">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all duration-200 relative group"
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-orange-50 text-[#E8730C] scale-110'
                  : 'text-gray-500 hover:text-[#E8730C] hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`mt-0.5 text-[10px] tracking-wide transition-all ${
                isActive
                  ? 'text-[#E8730C] font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {item.name}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E8730C] animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
