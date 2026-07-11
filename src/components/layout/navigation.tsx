"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/config/site";

function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (!item.children?.length) {
    return (
      <Link
        href={item.href}
        className="flex h-[70px] items-center px-[18px] text-[15px] text-black transition-colors hover:text-[#d4d4d4]"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        className="flex h-[70px] items-center px-[18px] text-[15px] text-black transition-colors hover:text-[#d4d4d4]"
      >
        {item.label}
      </Link>
      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[160px] border border-[#e7e7e7] bg-white py-2 shadow-sm">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-5 py-2.5 text-[14px] text-black transition-colors hover:bg-[#f5f5f5] hover:text-[#d4d4d4]"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="hidden items-center lg:flex">
      {items.map((item) => (
        <NavDropdown key={item.href} item={item} />
      ))}
    </nav>
  );
}

export function MobileNav({
  items,
  open,
  onClose,
}: {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[min(320px,85vw)] bg-white transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="text-sm font-semibold">메뉴</span>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[#838383]"
            aria-label="메뉴 닫기"
          >
            ×
          </button>
        </div>
        <nav className="overflow-y-auto p-4">
          {items.map((item) => (
            <div key={item.href} className="mb-4">
              <Link
                href={item.href}
                onClick={onClose}
                className="block py-2 text-[16px] font-medium text-black"
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className="block py-1.5 pl-4 text-[14px] text-[#838383]"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
