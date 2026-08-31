import { createPublicServerClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import type { ServiceCategory } from "@/features/catalog/types/catalog";
import type { ConfiguratorField, ConfiguratorOption, ServiceConfiguratorSchema } from "../types/configurator";
import { getConfiguratorSchema } from "./mock-configurators";

type DbOption = { value: string; label: string; price_multiplier: number | null; sort_order: number };
type DbField = {
  key: string;
  label: string;
  description: string | null;
  field_type: ConfiguratorField["type"];
  required: boolean;
  min_value: number | null;
  max_value: number | null;
  step_value: number | null;
  default_value: string | number | boolean | null;
  sort_order: number;
  service_field_options: DbOption[] | null;
};

function mapOption(option: DbOption): ConfiguratorOption {
  return {
    value: option.value,
    label: option.label,
    ...(option.price_multiplier !== null && option.price_multiplier !== 1
      ? { priceMultiplier: option.price_multiplier }
      : {}),
  };
}

function mapField(field: DbField): ConfiguratorField {
  return {
    key: field.key,
    label: field.label,
    ...(field.description ? { description: field.description } : {}),
    type: field.field_type,
    required: field.required,
    ...(field.min_value !== null ? { min: field.min_value } : {}),
    ...(field.max_value !== null ? { max: field.max_value } : {}),
    ...(field.step_value !== null ? { step: field.step_value } : {}),
    defaultValue: field.default_value ?? "",
    ...(field.service_field_options?.length
      ? { options: [...field.service_field_options].sort((a, b) => a.sort_order - b.sort_order).map(mapOption) }
      : {}),
  };
}

export async function getServiceConfiguratorSchema(input: {
  serviceId: string;
  category: ServiceCategory;
}): Promise<ServiceConfiguratorSchema> {
  if (!hasPublicSupabaseEnv()) return getConfiguratorSchema(input.category);

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("service_fields")
    .select("key, label, description, field_type, required, min_value, max_value, step_value, default_value, sort_order, service_field_options(value, label, price_multiplier, sort_order)")
    .eq("service_id", input.serviceId)
    .order("sort_order");

  if (error || !data?.length) {
    if (error) console.error("Configurator database read failed; using mock fallback.", error.message);
    return getConfiguratorSchema(input.category);
  }

  return {
    category: input.category,
    fields: (data as unknown as DbField[]).map(mapField),
    notes: getConfiguratorSchema(input.category).notes,
  };
}
