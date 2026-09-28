import { NextResponse } from "next/server";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { calculateDota2NetWinsPricing } from "@/features/pricing/server/dota-2-net-wins-pricing";
import { validateDota2PreferenceDetails } from "@/features/pricing/server/dota-2-preference-validation";
import { dota2PreferenceOptions, type Dota2Preference } from "@/features/configurator/data/dota-2-mmr-options";
interface Dota2NetWinsQuoteBody {
    selection?: ConfiguratorSelection;
}
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Dota2NetWinsQuoteBody;
        if (!body.selection)
            return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
        const preference = String(body.selection.preference) as Dota2Preference;
        if (!dota2PreferenceOptions.some((option) => option.value === preference))
            throw new Error("Select a valid preference.");
        const { blockingIssues } = validateDota2PreferenceDetails(body.selection, preference, "quote");
        const result = calculateDota2NetWinsPricing(body.selection, "quote");
        if (result.kind === "custom")
            return NextResponse.json({ customQuote: result.customQuote, checkoutEligible: false, blockingIssues });
        return NextResponse.json({ quote: result.quote, metadata: result.metadata, checkoutEligible: blockingIssues.length === 0, blockingIssues });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unable to calculate quote.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

