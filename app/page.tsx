import type { Metadata } from "next";
import { PromptLibrary } from "@/components/PromptLibrary";
import { getPrompts } from "@/lib/queries";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "AliPrompt — پرامپت‌های خلاقانه",
  description: "کتابخانه‌ای منتخب از پرامپت‌های حرفه‌ای هوش مصنوعی برای خلق تصاویر متفاوت.",
};

export default async function Home() {
  const prompts = await getPrompts();
  const previews = prompts.map(({ prompt_text, status, created_at, updated_at, ...preview }) => preview);

  return (
    <>
      <PromptLibrary prompts={previews} />
    </>
  );
}
