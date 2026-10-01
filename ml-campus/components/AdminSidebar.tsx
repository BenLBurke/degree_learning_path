'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  pendingCount: number;
  professorName: string;
}

const ICONS: Record<string, string> = {
  review: '📥',
  roster: '👥',
  students: '📊',
  mine: '🧭',
};

export default function AdminSidebar({ pendingCount, professorName }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { href: '/admin', label: 'Review Queue', icon: ICONS.review, badge: pendingCount, exact: true },
    { href: '/admin/roster', label: 'Roster', icon: ICONS.roster },
    { href: '/dashboard', label: 'My Dashboard', icon: ICONS.mine },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="w-60 shrink-0 border-r border-gray-800 bg-gray-950 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="text-lg font-bold text-white">ML Campus</div>
        <div className="text-xs text-indigo-400 font-medium mt-0.5">Professor Portal</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </span>
              {item.badge ? (
                <span className="min-w-5 h-5 px-1.5 flex items-center justify-center bg-red-600 text-white text-[11px] font-semibold rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <div className="text-sm text-gray-300 truncate">{professorName}</div>
        <a href="/api/auth/signout" className="text-xs text-gray-500 hover:text-gray-300">
          Sign out
        </a>
      </div>
    </aside>
  );
}
