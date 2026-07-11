"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20">
      <h1 className="mb-2 text-[28px] font-bold">로그인</h1>
      <p className="mb-8 text-center text-[15px] text-klead-gray-500">
        카카오 로그인은 2차 개발에서 제공됩니다.
      </p>

      <div className="w-full rounded border border-[#e7e7e7] bg-[#fafafa] px-6 py-5 text-center text-[14px] leading-relaxed text-[#838383]">
        현재는 공개 콘텐츠 열람만 가능합니다.
        <br />
        회원 기능은 추후 오픈 예정입니다.
      </div>

      <Link
        href="/"
        className="mt-8 text-[14px] text-klead-gray-500 hover:text-klead-primary"
      >
        ← 홈으로 돌아가기
      </Link>
    </div>
  );
}
