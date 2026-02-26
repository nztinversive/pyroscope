"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Map" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="border-b border-gray-800 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-fire-500 to-ember-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          Pyro<span className="text-fire-500">Scope</span>
        </Link>
        <div className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                path === l.href
                  ? "bg-gray-800 text-fire-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
