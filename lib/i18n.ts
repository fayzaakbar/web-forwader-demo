import { cookies } from "next/headers";
import type { Locale } from "@/lib/messages";
export { messages } from "@/lib/messages";
export type { Locale } from "@/lib/messages";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get("routewise_locale")?.value === "en" ? "en" : "id";
}
