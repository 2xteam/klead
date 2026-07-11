import { redirect } from "next/navigation";

/** 카카오 로그인 2차 이전 — 마이페이지는 로그인 페이지로 안내 */
export default function MypagePage() {
  redirect("/login");
}
