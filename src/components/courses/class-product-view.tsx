"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/config/site";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  createdAt: string;
}

export interface ProductQna {
  id: string;
  author: string;
  title: string;
  body: string;
  status: string;
  answer?: string;
  isPrivate?: boolean;
  createdAt: string;
}

export interface ClassProduct {
  slug: string;
  title: string;
  summary?: string;
  categoryLabel?: string;
  priceLabel: string;
  gallery: string[];
  likeCount: number;
}

type Tab = "detail" | "review" | "qna";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-klead-primary" aria-label={`평점 ${n}`}>
      {"★".repeat(n)}
      <span className="text-black/15">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ClassProductView({
  product,
  detail,
  reviews,
  qna,
}: {
  product: ClassProduct;
  detail: React.ReactNode;
  reviews: ProductReview[];
  qna: ProductQna[];
}) {
  const [tab, setTab] = useState<Tab>("detail");
  const [mainImg, setMainImg] = useState(product.gallery[0] ?? "");
  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const tabs: { key: Tab; label: string }[] = [
    { key: "detail", label: "상세정보" },
    { key: "review", label: `구매평 (${reviews.length})` },
    { key: "qna", label: `Q&A (${qna.length})` },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-klead-gray-500">
        <Link href="/" className="hover:text-klead-gray-900">
          Home
        </Link>
        <span>›</span>
        <Link href="/courses" className="hover:text-klead-gray-900">
          강의 종목
        </Link>
        {product.categoryLabel && (
          <>
            <span>›</span>
            <span>{product.categoryLabel}</span>
          </>
        )}
      </nav>

      {/* top: gallery + info */}
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#111]">
            {mainImg && (
              <Image
                src={mainImg}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 600px"
                priority
              />
            )}
          </div>
          {product.gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.gallery.map((g) => (
                <button
                  key={g}
                  onClick={() => setMainImg(g)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-md border ${
                    mainImg === g ? "border-klead-primary" : "border-black/10"
                  }`}
                >
                  <Image src={g} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categoryLabel && (
            <p className="mb-2 text-[13px] text-klead-gray-500">
              {product.categoryLabel}
            </p>
          )}
          <h1 className="text-[26px] font-bold leading-snug">{product.title}</h1>
          <p className="mt-4 text-[20px] font-bold text-klead-primary">
            {product.priceLabel}
          </p>
          {product.summary && (
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-klead-gray-500">
              {product.summary}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={brandAssets.sns.kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-black py-3.5 text-center text-[15px] font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              수강 문의하기
            </a>
            <button className="flex items-center justify-center gap-2 rounded-full border border-black/15 py-3.5 text-[15px] text-klead-gray-700">
              <span className="text-klead-primary">♡</span> {product.likeCount}
            </button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-14 grid grid-cols-3 border-y border-black/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-4 text-center text-[15px] transition-colors ${
              tab === t.key
                ? "border-b-2 border-black font-bold text-black"
                : "text-klead-gray-500 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-10">
        {tab === "detail" && <div>{detail}</div>}

        {tab === "review" && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-[15px]">
                <span className="text-[24px] font-bold text-klead-primary">
                  {avg}
                </span>
                <span className="ml-2 text-klead-gray-500">
                  / 구매평 {reviews.length}건
                </span>
              </p>
              <Link
                href="/login"
                className="rounded-full bg-klead-primary px-5 py-2.5 text-[14px] font-semibold text-white"
              >
                구매평 작성
              </Link>
            </div>
            <p className="mb-6 text-[13px] text-klead-gray-400">
              * 구매평은 해당 강의를 수강한 회원만 작성할 수 있습니다.
            </p>
            {reviews.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-klead-gray-400">
                아직 등록된 구매평이 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-black/10">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="mb-2 flex items-center gap-3">
                      <Stars n={r.rating} />
                      <span className="text-[14px] font-semibold">{r.author}</span>
                      <span className="text-[12px] text-klead-gray-400">
                        {r.createdAt}
                      </span>
                    </div>
                    {r.title && (
                      <p className="mb-1 text-[15px] font-semibold">{r.title}</p>
                    )}
                    <p className="whitespace-pre-line text-[14px] leading-relaxed text-klead-gray-700">
                      {r.body}
                    </p>
                    {r.images && r.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {r.images.map((im, i) => (
                          <div
                            key={i}
                            className="relative aspect-square w-20 overflow-hidden rounded-md bg-black/5"
                          >
                            <Image src={im} alt="" fill className="object-cover" sizes="80px" />
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "qna" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[15px] font-semibold">상품 Q&A {qna.length}건</p>
              <Link
                href="/login"
                className="rounded-full border border-black/15 px-5 py-2.5 text-[14px] font-medium"
              >
                상품 문의하기
              </Link>
            </div>
            {qna.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-klead-gray-400">
                아직 등록된 문의가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-black/10">
                {qna.map((q) => (
                  <li key={q.id} className="py-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                          q.status === "answered"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {q.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                      <span className="text-[15px] font-semibold">
                        {q.isPrivate ? "🔒 비공개 문의" : q.title}
                      </span>
                      <span className="ml-auto text-[12px] text-klead-gray-400">
                        {q.author} · {q.createdAt}
                      </span>
                    </div>
                    {!q.isPrivate && (
                      <p className="mt-2 whitespace-pre-line text-[14px] text-klead-gray-700">
                        {q.body}
                      </p>
                    )}
                    {q.answer && !q.isPrivate && (
                      <div className="mt-3 rounded-md bg-[#f7f7f7] p-4">
                        <p className="mb-1 text-[13px] font-bold text-klead-primary">
                          클리드 답변
                        </p>
                        <p className="whitespace-pre-line text-[14px] text-klead-gray-700">
                          {q.answer}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
