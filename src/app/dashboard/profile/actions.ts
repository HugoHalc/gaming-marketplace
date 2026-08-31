"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { normalizeText } from "@/features/auth/server/validation";

const ALLOWED_AVATARS = new Set(
  Array.from({ length: 8 }, (_, index) => `avatar-${String(index + 1).padStart(2, "0")}`),
);

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function updateProfileAction(formData: FormData) {
  const supabase = await createAuthServerClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/login");

  const fullName = normalizeText(formData.get("fullName"), 100);
  const phone = normalizeText(formData.get("phone"), 40) || null;
  const gamerTag = normalizeText(formData.get("gamerTag"), 80) || null;
  const avatarPreset = normalizeText(formData.get("avatarPreset"), 40);
  const avatarFile = formData.get("avatarFile");

  if (fullName.length < 2) redirect("/dashboard/profile?error=1");

  let avatarUrl: string | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_TYPES.has(avatarFile.type) || avatarFile.size > MAX_FILE_SIZE) {
      redirect("/dashboard/profile?error=1");
    }

    const extension =
      avatarFile.type === "image/png" ? "png" : avatarFile.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `${id}/avatar.${extension}`;
    const buffer = await avatarFile.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(storagePath, buffer, {
        contentType: avatarFile.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) redirect("/dashboard/profile?error=1");

    const { data: publicUrlData } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(storagePath);

    avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
  } else if (avatarPreset && ALLOWED_AVATARS.has(avatarPreset)) {
    avatarUrl = `/avatars/${avatarPreset}.webp`;
  }

  const updatePayload: {
    full_name: string;
    phone: string | null;
    gamer_tag: string | null;
    updated_at: string;
    avatar_url?: string;
  } = {
    full_name: fullName,
    phone,
    gamer_tag: gamerTag,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) updatePayload.avatar_url = avatarUrl;

  const { error } = await supabase.from("profiles").update(updatePayload).eq("id", id);
  if (error) redirect("/dashboard/profile?error=1");

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard/profile?saved=1");
}
