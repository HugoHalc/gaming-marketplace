import type { ServiceCategory } from "@/features/catalog/types/catalog";

export type ConfiguratorFieldType = "select" | "number" | "toggle";

export interface ConfiguratorOption {
  value: string;
  label: string;
  priceMultiplier?: number;
}

export interface ConfiguratorField {
  key: string;
  label: string;
  description?: string;
  type: ConfiguratorFieldType;
  required?: boolean;
  options?: ConfiguratorOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
}

export interface ServiceConfiguratorSchema {
  category: ServiceCategory;
  fields: ConfiguratorField[];
  notes: string[];
}

export type ConfiguratorSelection = Record<string, string | number | boolean>;

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
}

export interface QuotePreview {
  currency: "USD";
  subtotal: number;
  discount: number;
  total: number;
  ruleSetVersion: string;
  breakdown: QuoteBreakdownItem[];
}
