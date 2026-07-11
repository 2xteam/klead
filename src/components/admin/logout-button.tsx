"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-[13px] font-medium text-klead-gray-500 hover:text-klead-gray-900"
    >
      로그아웃
    </button>
  );
}
