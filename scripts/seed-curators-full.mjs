/**
 * 테크 큐레이터 실제 프로필(klead.kr) → R2 이관 + DB 등록.
 * 실행: npm run seed:curators
 * 구조(klead klebeauty 클론):
 *   profile(사진+실적+직함+경력) → slider(활동갤러리) → splitText(자격증)
 *   → splitText(이력) → slider(활동갤러리2)
 * 목록 카드 썸네일은 techcurator 페이지의 별도 썸네일 이미지 사용.
 */
import dns from "node:dns";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const PUB = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
const CDN = (id) => `https://cdn.imweb.me/thumbnail/20260529/${id}.png`;
const CDN10 = (id) => `https://cdn.imweb.me/thumbnail/20260710/${id}.png`;

function guessType(url) {
  const e = (url.split("?")[0].match(/\.([a-z0-9]+)$/i)?.[1] || "png").toLowerCase();
  const ct =
    { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[e] ||
    "image/png";
  return { ext: e, ct };
}

async function migrate(url, keyBase) {
  const { ext, ct } = guessType(url);
  const key = keyBase.replace(/\.[a-z0-9]+$/i, "") + "." + ext;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://klead.kr/" },
      });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: key,
          Body: buf,
          ContentType: ct,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      return `${PUB}/${key}`;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  // 원본 다운로드 실패: 이전 실행에서 이미 이관된 R2 객체가 있으면 그 URL을 사용
  const existing = await fetch(`${PUB}/${key}`, { method: "HEAD" });
  if (existing.ok) {
    console.warn(`  ! 원본 실패, 기존 R2 사용: ${key}`);
    return `${PUB}/${key}`;
  }
  throw lastErr;
}

// klebeauty(김보령) 활동 갤러리 2종
const G1 = [
  "a188eff3c5de5", "b95849cce7440", "959c26ab017f0", "d923bec17e1ec",
  "d497a38583aee", "fd4e0b70b7847", "7d3141d1de375", "a6770301deff7",
  "7559369fc75db", "922b7fdaf50eb",
].map(CDN);
const G2 = [
  "567f6e2450f00", "bbc36f894a77c", "d7391c18f3508", "c6f4ed4e0a2d6",
  "115501e8d02fc", "7aa355f811b2e", "1f30abc283f81", "07a9eae57999d",
  "ce218240fa751", "7117729221af1",
].map(CDN);

// klemare(김유정) 활동 갤러리 2종 (혼합 확장자, 실제 URL)
const KM_G1 = [
  "https://cdn.imweb.me/thumbnail/20260710/c11a7b5ffbad3.png",
  "https://cdn.imweb.me/thumbnail/20260710/48f79e8680d39.png",
  "https://cdn.imweb.me/thumbnail/20260710/163e30b992609.jpg",
  "https://cdn.imweb.me/thumbnail/20260710/efdb5881da5d4.png",
  "https://cdn.imweb.me/thumbnail/20260710/283f80c743f0a.png",
  "https://cdn.imweb.me/thumbnail/20260710/30ef4aa78fcb8.jpeg",
  "https://cdn.imweb.me/thumbnail/20260710/8ebe3b8929c1f.jpeg",
  "https://cdn.imweb.me/thumbnail/20260710/7e84abfa497e5.jpeg",
  "https://cdn.imweb.me/thumbnail/20260710/9b07c11aa3a0a.jpeg",
];
const KM_G2 = [
  "https://cdn.imweb.me/thumbnail/20260711/536e1a43f9f7d.jpeg",
  "https://cdn.imweb.me/thumbnail/20260711/82b83483caa68.jpeg",
  "https://cdn.imweb.me/thumbnail/20260711/0ed78fc497326.jpeg",
  "https://cdn.imweb.me/thumbnail/20260711/258fae3efaac1.jpeg",
  "https://cdn.imweb.me/thumbnail/20260711/1497e5e40dab5.jpeg",
  "https://cdn.imweb.me/thumbnail/20260711/13c6519bb45fb.jpeg",
];

const CURATORS = [
  {
    slug: "curator-kim-boryeong",
    name: "김보령",
    role: "클리드 대표",
    thumb: CDN10("111f62ccabd69"),
    photoSrc: CDN("ceccb3579fff0"),
    statPairs: [
      ["뷰티업 종사 경력", "18년차"],
      ["강사경력", "6년"],
      ["아카데미 수강생", "130명 배출"],
    ],
    career: ["현 ) 클리드 대표", "클뷰티 대표원장", "건국교육대학원 미용교육학과 석사과정", "캐론랩 정식 교육기관", "대한 메디컬 뷰티 협회 이사", "화장품 뷰티 학회 이사", "한국 인체 미용 예술 학회 정회원", "K뷰티연합회 지회장", "국제표준뷰티융합총연합회 IBS 지회장"],
    licenses: ["뷰티일러스트 3급 자격증", "창업 상권 분석 지도자 1급 자격증", "International trichologists federation KCT LEVEL 2 취득", "디지털 마케팅 전문가", "피부 미용 코디네이터", "왁싱코디네이터 1급 자격증", "산후관리사 1급 자격증", "스피치 지도사 1급 자격증", "SCC 국제미용전문강사 자격증", "HRC 호주 대학 교육강사 자격증", "교원자격증"],
    experience: ["국제 바디 콘테스트 왁싱 총괄 운영위원장", "국회의원 표창장 수상 / 더불어민주당 국회의원 이언주", "국제 바디 콘테스트 왁싱 총괄 운영위원장", "국제표준뷰티융합총연합회 지회장", "GLOBAL MASTER K-STAR 수상", "K-BEAUTY STAR CLUB STAR INSTRUCTOR 수상", "고려대학교 뷰티최고전문가과정 왁싱플래닝 강사", "18th I.B.A.C 이사장상 수상", "국제 바디 콘테스트 왁싱 총괄 심사감독관장", "동의과학대학교 성인 재취업 직업교육훈련 왁싱플래닝 특강교사", "INTERNATIONAL STANDARD EVALUATION CONTEST DP 총괄부위원장", "IBS 국제 표준 평가경연대회 조직운영위원", "KING OF KINGS 제주대회 수석 대회 협력위원장", "국제뷰티마스터 콘테스트 멘토 그랑프리 수상", "International bodyart contest 글로벌 리더 수상", "K-BEAUTY RISING STAR ACADEMY 수상", "K-BEAUTY 왁싱총괄기술평가위원장", "K뷰티 왁싱총괄기술평가위원장", "K뷰티 일본 글로벌 왁싱 기술평가 위원장", "K뷰티 전문가 연합회 회장 임명", "국제 바디 콘테스트 왁싱 기술평가위원장", "국제 바디 콘테스트 왁싱 수석 심사위원장", "K뷰티 전문가 연합회 지부장 임명", "캐론랩 천연호주왁스 송파구교육기관", "국제뷰티표준교육기관 IBQC 실기평가경원대회 심사평가위원", "제11회 국제바디 아트콘테스트 스킨플래닝 수석 심사위원", "K뷰티전문가 연합회 반영구 수석 심사위원", "국제 아트 메이크업 올림픽대회 국제 심사위원", "클뷰티 운영", "웰킨 두피탈모센터 관리운영 및 상담"],
    gallery1: G1,
    gallery2: G2,
  },
  {
    slug: "curator-kim-yujeong",
    name: "김유정",
    role: "클레마르 헤드스파 원장",
    thumb: CDN10("8a2689ff273d2"),
    photoSrc: CDN10("33d2cc77e0b82"),
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["현 ) 클리드 헤드스파 강사", "두피본* 두피탈모센터 원장", "닥터모* 두피탈모센터 실장", "닥터스칼* 두피탈모센터 실장", "웰* 두피탈모센터 관리 팀장"],
    licenses: ["한국두피모발관리사 1, 2급", "두피모발상담사 자격증", "아로마 전문 지도사 1, 2급", "두피, 탈모 케어 전문 지도사 1, 2급", "리더십 지도사 1, 2급", "미용사(피부)국가자격증", "에스테틱 국가자격증", "미용 전문학사", "종합 피부미용사 면허증"],
    experience: [],
    linkTitle: "KLEMARE",
    linkSubtitle: "클레마르",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/FY3fhkOn" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/_seollia_/" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/munsh9603" },
    ],
    gallery1: KM_G1,
    gallery2: KM_G2,
  },
  {
    slug: "curator-shin-semi",
    name: "신세미",
    role: "유얼뷰티 아카데미 대표원장",
    thumb: CDN10("e3301444e4e7f"),
    photoSrc: "https://cdn.imweb.me/thumbnail/20260711/ee3ad66992315.png",
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["본질을 더하다 마케팅회사 이사", "뷰티PT 송파 왁싱 트레이닝 센터"],
    licenses: ["국제바디아트콘테스트 왁싱 운영위원장", "국제바디아트콘테스트 왁싱 총괄기술평가위원장", "국제바디아트콘테스트 피부 총괄심사감독관장", "K뷰티전문가연합회 교육인정강사", "ISEA 1급 피부국가자격증 교육강사", "미용사(피부) 국가자격증", "헤어, 메이크업, 스킨케어, 네일, 업스타일 2-3급", "클라우드 9 컬리지 교육인정강사"],
    experience: ["국제뷰티아트콘테스트 베스트 팀워크상", "국제바디아트콘테스트 라이징스타 아카데미상", "국제바디아트콘테스트 이사장상", "국회의원 김성재의원 표창상"],
    linkTitle: "URBEAUTY",
    linkSubtitle: "유얼뷰티",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/GFBdeX0Z" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/urbeauty_academy/" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/urbeauty98" },
    ],
    gallery1: [
      "https://cdn.imweb.me/thumbnail/20260711/ed85752698e4d.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/5e22f06413088.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/4c6f9a3681ad5.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/baf53eca425a5.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/f5a4558bb95a4.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/6eca338bc99bb.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/92fe228866a76.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/70394dc5572cb.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/34bd6761422d0.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/a014d18b7c33d.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/b17d4c336d651.jpeg",
    ],
  },
  {
    slug: "curator-moon-seolhui",
    name: "문설희",
    role: "설리아 대표원장",
    thumb: CDN10("4b7afb6c0c042"),
    photoSrc: CDN10("6f02717c59219"),
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["클리드 교육인증기관", "대한뷰티메디컬협회 임산부왁싱 정회원"],
    licenses: ["미용사(피부)국가자격증", "K뷰티전문가연합회 스킨케어 전문 교육 강사", "K뷰티전문가연합회 왁싱 전문 교육 강사", "K뷰티전문가연합회 강사", "클뷰티 창업 전문가 수강", "엑시드닝 수료", "클리드 테크 큐레이터 강사 과정 수료"],
    experience: ["국제뷰티아트컨퍼런스 왁싱 수석기술평가위원", "제 2회 월드뷰티디자인콘테스트 왁싱 심사위원", "제 22회 국제바디아트콘테스트 왁싱 기술평가위원장", "제 19회 국제바디아트콘테스트 그랜드 그랑프리 수상"],
    linkTitle: "SEOLIA",
    linkSubtitle: "설리아",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/IMymSuRb" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/_seollia_/" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/munsh9603" },
    ],
    gallery1: [
      "https://cdn.imweb.me/thumbnail/20260710/c87e76ef1eb6f.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/1866ef12362cc.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/0494454110195.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/b3fd63375c305.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/e6162a1ed7ca7.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/70f11cddd52a1.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/267aa9c969b2e.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/a6fa153c6d6d6.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/1841b9131a76d.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/cd45dcd20d1de.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/be4971ca19e0b.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/32316f29b38b5.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/cc7d0951b20da.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/a031e9cf42fdd.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/1be5b794687ef.jpeg",
    ],
    gallery2: [
      "https://cdn.imweb.me/thumbnail/20260710/eb2a0f0144f56.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/522f4decf569f.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/b982b63acf708.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/4bad7be499533.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/e28553cbcb5c9.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/2c659a23c6596.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/fc4b03684d044.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/39040b41a6447.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/ee7f82f344a22.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/ea9d404264d03.jpeg",
      "https://cdn.imweb.me/thumbnail/20260710/4e629053f6fb5.jpeg",
    ],
  },
  {
    slug: "curator-lee-hayan",
    name: "이하얀",
    role: "뷰티인하얀 대표원장",
    thumb: CDN10("d2f9a3367d365"),
    photoSrc: "https://cdn.imweb.me/thumbnail/20260711/1cb9b0fd16f0e.png",
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["클리드 교육인증기관", "대한뷰티메디컬협회 임산부왁싱 정회원"],
    licenses: ["미용사(피부) 국가자격증", "제23회 IBAC 왁싱 기술평가위원", "제18회 IBAC 왁싱 심사장", "제17회 국제바디아트콘테스트 왁싱 심사위원"],
    experience: ["국제바디아트콘테스트 왁싱부분 그랑프리 수상"],
    linkTitle: "BEAUTY IN HAYAN",
    linkSubtitle: "뷰티인하얀",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/F88IpkXi" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/beauty_in_hayan" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/sulbeauty" },
    ],
    gallery1: [
      "https://cdn.imweb.me/thumbnail/20260711/0a0134063ed56.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/5c6204ed54f11.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/f03a78758c5dc.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/dfc21220ebd00.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/a04740dcdbfa0.jpeg",
    ],
    gallery2: [
      "https://cdn.imweb.me/thumbnail/20260711/e7e22d0d82ebe.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/f165bb71594bd.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/cf137184a9339.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/245b19fab7476.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/341f3ee959c71.jpeg",
    ],
  },
  {
    slug: "curator-jo-euna",
    name: "조은아",
    role: "비쥬왁싱 대표원장",
    thumb: CDN10("372965e04929a"),
    photoSrc: "https://cdn.imweb.me/thumbnail/20260711/7c244dae6765e.png",
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["클리드 교육인증기관", "대한뷰티메디컬협회 임산부왁싱 정회원", "비에라 공식 인증 강사", "비에라 공식 인증 교육센터", "호주 헤르티지컬리지 교육인증강사"],
    licenses: ["네일, 미용사(피부)국가자격증", "에르모소 왁싱 과정 수료", "비에라 Training Supervisor 과정 수료", "비에라 Waxing Master 과정 수료", "K뷰티전문가연합회 왁싱교육 이수", "K뷰티전문가연합회 에스테틱 이수", "K뷰티전문가연합회 인증 교육강사", "K뷰티전문가연합회 김포 지부장", "K뷰티전문가연합회 왁싱 심사위원", "국제 바디아트콘테스트 수석 심사장", "국제 바디아트콘테스트 왁싱 수석 심사위원장", "국제 뷰티아트컨퍼런스 수석 기술평가위원장", "국제 미용건강콘텐츠협회 플라즈마 심사위원", "대한메디컬협회 임산부 왁싱 코디네이터 취득"],
    experience: ["국제 미용건강콘텐츠협회 국회의원 지도자상 수상", "국제 미용건강콘텐츠협회 플라즈마 그랑프리 수상"],
    linkTitle: "BIJOU WAXING",
    linkSubtitle: "비쥬왁싱",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/FO9wB6v6" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/bijou._.waxing/" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/o_o_bijou_" },
    ],
    gallery1: [
      "https://cdn.imweb.me/thumbnail/20260711/96ce81f5e05d5.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/8e19d0002f245.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/33054824fac69.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/0d6d10bfceca8.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/bf6a4bcead0c5.jpeg",
    ],
    gallery2: [
      "https://cdn.imweb.me/thumbnail/20260711/a88dc7d85ca9f.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/6ce9e5de3c257.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/1884eb0bad3a6.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/017c1bfca07ec.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/3329d6acbfad7.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/c8b343ce8fe47.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/9695d1ccc9dda.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/3815976adc905.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/8d80035495f88.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/49e63f8dfd0ec.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/1877b5fb5f982.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/ba99f29081433.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/b0a7644dcaeef.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/fcfc981208695.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/29778ca7d1b18.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/771d9744e1239.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/95eba63e894bf.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/7b5e2bc848199.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/41e6712c80393.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/8cde315583fec.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/aab24dadd2d10.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/b0454d6c95cf8.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/404b8a1cd8594.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/456121ad3b482.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/ebc91141a7354.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/e0b21bdbeae63.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/d7a87719c5373.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/04b09f8874dc2.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/f92b2cd11e5dd.jpeg",
    ],
  },
  {
    slug: "curator-chae-hansol",
    name: "채한솔",
    role: "아르니왁싱 대표원장",
    thumb: CDN10("2a74e443960b6"),
    photoSrc: "https://cdn.imweb.me/thumbnail/20260711/334eb129c947d.png",
    stats: ["클리드 공식", "테크 큐레이터"],
    career: ["클리드 교육인증기관", "대한뷰티메디컬협회 임산부왁싱 정회원", "IBEA 국제미용교육협회", "호주 헤르티지컬리지 교육인증강사"],
    licenses: [],
    experience: [],
    linkTitle: "ARRNY WAXING",
    linkSubtitle: "아르니왁싱",
    linkCards: [
      { title: "네이버 플레이스", img: CDN10("4858b3f061e5f"), url: "https://naver.me/FlZ4rSXJ" },
      { title: "인스타그램", img: CDN10("e2da15c4849b1"), url: "https://www.instagram.com/arrny_klead/" },
      { title: "네이버 블로그", img: CDN10("13140d3430825"), url: "https://blog.naver.com/arrrny" },
    ],
    gallery1: [
      "https://cdn.imweb.me/thumbnail/20260711/1e8578822cb6c.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/9c153ce6f9326.jpeg",
      "https://cdn.imweb.me/thumbnail/20260711/57bcba40f0e63.jpeg",
    ],
  },
];

function buildSections(c, { photoUrl, g1, g2, linkCards, bannerId }) {
  const sections = [];
  let order = 0;
  const statItems = c.statPairs
    ? c.statPairs.map(([title, description], i) => ({ title, description, sortOrder: i }))
    : (c.stats ?? []).map((title, i) => ({ title, sortOrder: i }));

  sections.push({
    key: "profile",
    type: "profile",
    theme: "dark",
    imageUrl: photoUrl,
    subtitle: c.role,
    title: c.name,
    body: c.career.join("\n"),
    items: statItems,
    sortOrder: order++,
  });
  if (linkCards?.length) {
    sections.push({
      key: "links",
      type: "linkCards",
      theme: "dark",
      title: c.linkTitle,
      subtitle: c.linkSubtitle,
      items: linkCards.map((it, i) => ({
        title: it.title,
        imageUrl: it.imageUrl,
        linkUrl: it.url,
        linkLabel: "BUTTON",
        sortOrder: i,
      })),
      sortOrder: order++,
    });
  }
  if (g1?.length) {
    sections.push({
      key: "gallery1",
      type: "slider",
      theme: "dark",
      items: g1.map((imageUrl, i) => ({ imageUrl, sortOrder: i })),
      sortOrder: order++,
    });
  }
  if (c.licenses.length) {
    sections.push({
      key: "licenses",
      type: "splitText",
      theme: "dark",
      title: "CERTIFICATION & LICENSES",
      body: c.licenses.join("\n"),
      lazy: true,
      sortOrder: order++,
    });
  }
  // 자격증 ↔ 이력 사이 가로 구분선(바)
  if (c.licenses.length && c.experience.length) {
    sections.push({
      key: "divider",
      type: "divider",
      theme: "dark",
      sortOrder: order++,
    });
  }
  if (c.experience.length) {
    sections.push({
      key: "experience",
      type: "splitText",
      theme: "dark",
      title: "PROFESSIONAL EXPERIENCE",
      body: c.experience.join("\n"),
      lazy: true,
      sortOrder: order++,
    });
  }
  if (g2?.length) {
    sections.push({
      key: "gallery2",
      type: "slider",
      theme: "dark",
      imagePosition: "right", // 역방향 슬라이드
      items: g2.map((imageUrl, i) => ({ imageUrl, sortOrder: i })),
      sortOrder: order++,
    });
  }
  // 최하단: 파트너사 배너 (배너 관리 참조)
  if (bannerId) {
    sections.push({
      key: "partner-banner",
      type: "banner",
      bannerId,
      sortOrder: order++,
    });
  }
  return sections;
}

const Content =
  mongoose.models.Content ||
  mongoose.model("Content", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Banner =
  mongoose.models.Banner ||
  mongoose.model("Banner", new mongoose.Schema({}, { strict: false, timestamps: true }));

await mongoose.connect(process.env.MONGODB_URI);
const published = { status: "published", startDt: new Date("2026-01-01T00:00:00Z") };

// 파트너사 배너 (모든 큐레이터 최하단에 참조로 삽입)
const ABOUT = `${PUB}/klead/about`;
const partnerBanner = await Banner.findOneAndUpdate(
  { name: "파트너사 배너" },
  {
    name: "파트너사 배너",
    subtitle: "파트너사 현황",
    title: "클리드와 함께하는 파트너들",
    backgroundImage: `${ABOUT}/about-bg-partners.jpg`,
    logos: [1, 2, 3, 4, 5].map((n) => `${ABOUT}/about-partner-${n}.png`),
    isActive: true,
  },
  { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
);
const partnerBannerId = String(partnerBanner._id);
console.log(`파트너 배너: ${partnerBannerId}`);

// 기존 큐레이터 문서 제거(접두어 slug 정리) 후 접두어 없는 slug로 재생성
await Content.deleteMany({ contentCategory: "curator" });

for (const c of CURATORS) {
  const thumbUrl = await migrate(c.thumb, `klead/curators/${c.slug}-thumb.png`);
  const photoUrl = c.photoSrc
    ? await migrate(c.photoSrc, `klead/curators/${c.slug}-profile.png`)
    : thumbUrl;
  async function migrateGallery(urls, prefix) {
    const out = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        out.push(await migrate(urls[i], `klead/curators/${c.slug}-${prefix}-${i}`));
      } catch {
        console.warn(`  ! 갤러리 이미지 건너뜀: ${urls[i]}`);
      }
    }
    return out;
  }
  let g1, g2, linkCards;
  if (c.gallery1?.length) g1 = await migrateGallery(c.gallery1, "g1");
  if (c.gallery2?.length) g2 = await migrateGallery(c.gallery2, "g2");
  if (c.linkCards?.length) {
    linkCards = [];
    for (let i = 0; i < c.linkCards.length; i++) {
      const lc = c.linkCards[i];
      linkCards.push({
        title: lc.title,
        url: lc.url,
        imageUrl: await migrate(lc.img, `klead/curators/${c.slug}-link-${i}`),
      });
    }
  }
  const sections = buildSections(c, {
    photoUrl,
    g1,
    g2,
    linkCards,
    bannerId: partnerBannerId,
  });
  const publicSlug = c.slug.replace(/^curator-/, "");
  await Content.findOneAndUpdate(
    { slug: publicSlug },
    {
      slug: publicSlug,
      type: "content",
      contentCategory: "curator",
      title: c.name,
      summary: c.role,
      thumbnail: thumbUrl,
      sections,
      isPublic: true,
      publish: published,
      seo: { title: `${c.name} | 클리드 테크 큐레이터`, description: c.role },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`${c.name} (${c.role}): 섹션 ${sections.length} · 경력 ${c.career.length} · 자격 ${c.licenses.length} · 이력 ${c.experience.length} · 갤러리 ${(g1?.length ?? 0) + (g2?.length ?? 0)}`);
}
await mongoose.disconnect();
console.log("완료.");
