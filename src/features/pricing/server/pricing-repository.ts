import { createSecretServerClient } from "@/lib/supabase/server";
import { hasSecretSupabaseEnv } from "@/lib/supabase/env";

export type PricingRule = {
  ruleType: string;
  condition: Record<string, unknown>;
  effect: Record<string, unknown>;
  priority: number;
};

export type PricingRuleSet = { version: string; rules: PricingRule[] };

export async function getActivePricingRuleSet(serviceId: string): Promise<PricingRuleSet | null> {
  if (!hasSecretSupabaseEnv()) return null;

  const supabase = createSecretServerClient();
  const { data: ruleSet, error: ruleSetError } = await supabase
    .from("pricing_rule_sets")
    .select("id, version")
    .eq("service_id", serviceId)
    .eq("status", "active")
    .maybeSingle();

  if (ruleSetError || !ruleSet) {
    if (ruleSetError) console.error("Pricing rule-set lookup failed.", ruleSetError.message);
    return null;
  }

  const { data: rules, error: rulesError } = await supabase
    .from("pricing_rules")
    .select("rule_type, condition, effect, priority")
    .eq("rule_set_id", ruleSet.id)
    .order("priority");

  if (rulesError) {
    console.error("Pricing rules lookup failed.", rulesError.message);
    return null;
  }

  return {
    version: ruleSet.version,
    rules: (rules ?? []).map((rule) => ({
      ruleType: rule.rule_type,
      condition: (rule.condition ?? {}) as Record<string, unknown>,
      effect: (rule.effect ?? {}) as Record<string, unknown>,
      priority: rule.priority,
    })),
  };
}
