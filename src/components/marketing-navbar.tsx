"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Who It's For", href: "/#services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export function MarketingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffaf2]/95 shadow-[0_6px_20px_rgba(15,12,9,0.06)] backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-8 md:py-5">
        <Link href="/" className="inline-flex items-center text-[#15120f]" aria-label="PM Freak Home">
          <Image
            src="/brand/pmfreak-logo.png"
            alt="PM Freak"
            width={220}
            height={56}
            priority
            className="h-9 w-auto object-contain md:h-11"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-sm font-medium text-[#15120f]/75 transition-all duration-200 hover:-translate-y-0.5 hover:text-[#15120f]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#b8a58c] transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden justify-self-end md:block">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full bg-[#b8a58c] px-5 py-2.5 text-sm font-semibold text-[#15120f] shadow-[0_8px_20px_rgba(25,18,11,0.16)] transition duration-200 hover:-translate-y-1 hover:bg-[#ac9a84] hover:shadow-[0_14px_28px_rgba(25,18,11,0.2)]"
          >
            Create Account
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center justify-self-end rounded-xl border border-black/10 text-[#15120f] transition hover:bg-[#f7efdf] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <div className={`grid transition-all duration-300 ease-out md:hidden ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden border-t border-black/10 bg-[#fffaf2]">
          <nav className="flex flex-col gap-1 px-5 pb-5 pt-3" aria-label="Mobile main">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-[#15120f]/85 transition-colors hover:bg-[#f5ecdb] hover:text-[#15120f]"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className="mt-2 inline-flex w-full justify-center rounded-full bg-[#b8a58c] px-4 py-2.5 text-sm font-semibold text-[#15120f] shadow-[0_8px_20px_rgba(25,18,11,0.16)] transition duration-200 hover:-translate-y-1 hover:bg-[#ac9a84]"
              onClick={() => setIsOpen(false)}
            >
              Create Account
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
