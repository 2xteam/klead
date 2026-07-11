import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 (S3 호환) 스토리지 유틸.
 * env: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 *      R2_PUBLIC_URL, R2_PREFIX(선택, 공유 버킷 격리용)
 */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

const prefix = () => process.env.R2_PREFIX ?? "";

/** 프리픽스를 적용한 실제 오브젝트 키 */
export function objectKey(key: string): string {
  const clean = key.replace(/^\/+/, "");
  return `${prefix()}${clean}`;
}

/** 오브젝트 키의 공개 URL */
export function publicUrl(key: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${objectKey(key)}`;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}

/** 바이너리 업로드 후 공개 URL 반환 */
export async function uploadObject(params: {
  key: string;
  body: Uint8Array | Buffer | string;
  contentType?: string;
  cacheControl?: string;
}): Promise<UploadResult> {
  const key = objectKey(params.key);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET"),
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000, immutable",
    }),
  );
  return { key, publicUrl: publicUrl(params.key) };
}

/** 원격 URL을 받아 R2로 재업로드 (외부 CDN → 자체 호스팅 이관용) */
export async function uploadFromUrl(
  sourceUrl: string,
  key: string,
): Promise<UploadResult> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`fetch ${sourceUrl} → ${res.status}`);
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";
  const buf = Buffer.from(await res.arrayBuffer());
  return uploadObject({ key, body: buf, contentType });
}

export async function deleteObject(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: requireEnv("R2_BUCKET"),
      Key: objectKey(key),
    }),
  );
}

export async function listObjects(sub = "", maxKeys = 1000) {
  const res = await getR2Client().send(
    new ListObjectsV2Command({
      Bucket: requireEnv("R2_BUCKET"),
      Prefix: objectKey(sub),
      MaxKeys: maxKeys,
    }),
  );
  return (res.Contents ?? []).map((o) => ({ key: o.Key, size: o.Size }));
}
