"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { Check, Save, Upload, X } from "lucide-react";
import { saveAvatarAction } from "@/app/dashboard/profile/actions";

const presetAvatars = Array.from({ length: 8 }, (_, index) => ({
  id: `avatar-${String(index + 1).padStart(2, "0")}`,
  src: `/avatars/avatar-${String(index + 1).padStart(2, "0")}.webp`,
}));

type ProfileAvatarPickerProps = {
  currentAvatarUrl?: string | null;
};

export function ProfileAvatarPicker({ currentAvatarUrl }: ProfileAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(
    currentAvatarUrl?.startsWith("/avatars/")
      ? currentAvatarUrl.split("/").pop()?.replace(".webp", "") ?? ""
      : "",
  );
  const [customPreview, setCustomPreview] = useState(
    currentAvatarUrl && !currentAvatarUrl.startsWith("/avatars/") ? currentAvatarUrl : "",
  );
  const [customFileSelected, setCustomFileSelected] = useState(false);

  const preview =
    customPreview ||
    presetAvatars.find((avatar) => avatar.id === selectedPreset)?.src ||
    presetAvatars[0].src;

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedPreset("");
    setCustomPreview(URL.createObjectURL(file));
    setCustomFileSelected(true);
  };

  const choosePreset = (id: string) => {
    setSelectedPreset(id);
    setCustomPreview("");
    setCustomFileSelected(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeCustom = () => {
    setCustomPreview("");
    setCustomFileSelected(false);
    setSelectedPreset(
      currentAvatarUrl?.startsWith("/avatars/")
        ? currentAvatarUrl.split("/").pop()?.replace(".webp", "") ?? "avatar-01"
        : "avatar-01",
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasSelection = Boolean(selectedPreset || customFileSelected);

  return (
    <form action={saveAvatarAction} encType="multipart/form-data">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411] p-6">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#A0AAA4]">
            Profile picture
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5]">
            Choose your identity.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
            Pick a BoostingPedia avatar or upload your own image.
          </p>

          <div className="mt-7 flex justify-center">
            <div className="relative size-48 overflow-hidden rounded-full border border-[#39E56F]/35 bg-[#090D0B] shadow-[0_0_34px_rgba(57,229,111,0.08)]">
              <img
                src={preview}
                alt="Profile avatar preview"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[#667069]">Profile preview</p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#FFFFFF14] bg-[#131B17] text-sm font-semibold text-[#F4F7F5] transition-colors hover:border-white/[0.18] hover:bg-[#18211C]"
          >
            <Upload className="size-4" />
            Upload your own image
          </button>

          {customFileSelected ? (
            <button
              type="button"
              onClick={removeCustom}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/[0.05]"
            >
              <X className="size-4" />
              Remove selected photo
            </button>
          ) : null}

          <button
            type="submit"
            disabled={!hasSelection}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#39E56F] text-sm font-semibold text-[#050807] shadow-[0_10px_30px_-18px_rgba(57,229,111,.65)] transition-[background-color,opacity] hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="size-4" />
            Save avatar
          </button>

          <p className="mt-3 text-center text-[11px] text-[#667069]">
            JPG, PNG or WebP. Max size 5MB.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411] p-6 sm:p-7">
          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#A0AAA4]">
              Select an avatar
            </p>
            <h3 className="mt-2 text-xl font-bold text-[#F4F7F5]">
              BoostingPedia presets
            </h3>
          </div>

          <input type="hidden" name="avatarPreset" value={selectedPreset} />
          <input
            ref={inputRef}
            type="file"
            name="avatarFile"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFileChange}
          />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {presetAvatars.map((avatar) => {
              const active = selectedPreset === avatar.id && !customFileSelected;

              return (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => choosePreset(avatar.id)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border bg-[#090D0B] p-2 transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 ${
                    active
                      ? "border-[#39E56F]/70 bg-[#39E56F]/[0.04]"
                      : "border-[#FFFFFF14] hover:border-white/[0.18]"
                  }`}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full border border-white/[0.06]">
                    <Image src={avatar.src} alt="" fill sizes="160px" className="object-cover" />
                  </div>

                  {active ? (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-7 border-t border-[#FFFFFF14] pt-6">
            <p className="text-sm font-semibold text-[#F4F7F5]">Custom image tips</p>
            <div className="mt-3 grid gap-2 text-xs text-[#A0AAA4] sm:grid-cols-2">
              <span>Square image recommended</span>
              <span>Minimum 500 × 500px</span>
              <span>Good lighting and contrast</span>
              <span>Avoid very busy backgrounds</span>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
