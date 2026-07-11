import connectDB from "@/lib/db/mongodb";
import { SiteSetting } from "@/lib/db/models";
import {
  SettingsManager,
  type SettingDTO,
  type SettingGroup,
} from "@/components/admin/settings-manager";

export const dynamic = "force-dynamic";

const MASK = "********";

/** Mixed value → textarea 편집용 문자열 (문자열은 그대로, 객체는 JSON) */
function serializeValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function AdminSettingsPage() {
  await connectDB();
  const docs = await SiteSetting.find().sort({ group: 1, key: 1 }).lean();

  const settings: SettingDTO[] = docs.map((d) => {
    const masked = d.key === "admin_password";
    return {
      _id: String(d._id),
      key: d.key,
      value: masked ? MASK : serializeValue(d.value),
      group: (d.group ?? "general") as SettingGroup,
      description: d.description ?? "",
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
      masked,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold">사이트 설정</h1>
        <p className="mt-1 text-[13px] text-klead-gray-500">
          총 {settings.length}개 · 로고, 배너, SNS 링크 등 key/value 설정
        </p>
      </div>

      <SettingsManager settings={settings} />
    </div>
  );
}
