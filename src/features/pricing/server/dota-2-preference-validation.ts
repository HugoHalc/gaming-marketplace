import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { DOTA2_MAX_ROLE_PREFERENCES, dota2RoleOptions, type Dota2Preference, type Dota2Role, } from "@/features/configurator/data/dota-2-mmr-options";
export type Dota2QuoteBlockingIssue = {
    code: "roles_required" | "hero_required";
    message: string;
};
export type Dota2PreferenceValidationMode = "quote" | "order";
export function validateDota2PreferenceDetails(selection: ConfiguratorSelection, preference: Dota2Preference, mode: Dota2PreferenceValidationMode = "order") {
    const rawRoles = selection.roles;
    if (typeof rawRoles !== "string")
        throw new Error("Invalid role preference.");
    const roles = rawRoles.length ? rawRoles.split(",") : [];
    const unique = new Set(roles);
    if (unique.size !== roles.length)
        throw new Error("Duplicate role preference.");
    if (roles.some((role) => !dota2RoleOptions.some((option) => option.value === role))) {
        throw new Error("Select valid roles.");
    }
    if (roles.length > DOTA2_MAX_ROLE_PREFERENCES) {
        throw new Error(`Select between 1 and ${DOTA2_MAX_ROLE_PREFERENCES} roles.`);
    }
    if (preference !== "roles" && roles.length > 0) {
        throw new Error("Role preferences apply only to Specific Roles.");
    }
    const rawHero = selection.heroName;
    if (typeof rawHero !== "string")
        throw new Error("Invalid hero preference.");
    const heroName = rawHero.trim();
    if (preference !== "hero" && heroName) {
        throw new Error("Hero preference applies only to Specific Hero.");
    }
    const blockingIssues: Dota2QuoteBlockingIssue[] = [];
    if (preference === "roles" && roles.length === 0) {
        if (mode === "order")
            throw new Error("Select at least one role to continue.");
        blockingIssues.push({ code: "roles_required", message: "Select at least one role to continue." });
    }
    if (preference === "hero" && !heroName) {
        if (mode === "order")
            throw new Error("Select a hero to continue.");
        blockingIssues.push({ code: "hero_required", message: "Select a hero to continue." });
    }
    return { roles: roles as Dota2Role[], heroName, blockingIssues };
}

