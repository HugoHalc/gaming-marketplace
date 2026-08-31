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

async function getAuthenticatedProfileClient() {
  const supabase = await createAuthServerClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;

  if (!id) redirect("/login");

  return { supabase, id };
}

export async function saveAvatarAction(formData: FormData) {
  const { supabase, id } = await getAuthenticatedProfileClient();

  const avatarPreset = normalizeText(formData.get("avatarPreset"), 40);
  const avatarFile = formData.get("avatarFile");

  let avatarUrl: string | null = null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_TYPES.has(avatarFile.type)) {
      redirect("/dashboard/profile?avatarError=type");
    }

    if (avatarFile.size > MAX_FILE_SIZE) {
      redirect("/dashboard/profile?avatarError=size");
    }

    const extension =
      avatarFile.type === "image/png"
        ? "png"
        : avatarFile.type === "image/webp"
          ? "webp"
          : "jpg";

    const storagePath = `${id}/avatar.${extension}`;
    const buffer = await avatarFile.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(storagePath, buffer, {
        contentType: avatarFile.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Profile avatar upload failed:", uploadError);
      redirect("/dashboard/profile?avatarError=upload");
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(storagePath);

    avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
  } else if (avatarPreset && ALLOWED_AVATARS.has(avatarPreset)) {
    avatarUrl = `/avatars/${avatarPreset}.webp`;
  }

  if (!avatarUrl) {
    redirect("/dashboard/profile?avatarError=selection");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Profile avatar update failed:", error);
    redirect("/dashboard/profile?avatarError=save");
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard/profile?avatarSaved=1");
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, id } = await getAuthenticatedProfileClient();

  const fullName = normalizeText(formData.get("fullName"), 100);
  const phone = normalizeText(formData.get("phone"), 40) || null;
  const gamerTag = normalizeText(formData.get("gamerTag"), 80) || null;

  if (fullName.length < 2) {
    redirect("/dashboard/profile?profileError=validation");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      gamer_tag: gamerTag,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Profile details update failed:", error);
    redirect("/dashboard/profile?profileError=save");
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard/profile?profileSaved=1");
}
