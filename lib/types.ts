export type Prompt = {
  id: string; title: string; slug: string; description: string;
  prompt_text: string; category: string; tags: string[]; image_url: string;
  status: "published" | "draft"; created_at: string; updated_at: string;
};
export type PromptInput = Omit<Prompt, "id" | "created_at" | "updated_at">;
export type PromptPreview = Omit<Prompt, "prompt_text" | "status" | "created_at" | "updated_at">;
