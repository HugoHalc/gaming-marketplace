# Phase 14V — Registration Legal Consent

Adds mandatory policy acceptance to account creation.

## Registration UX
Before `Create account`, users must accept:
- Terms & Conditions
- Privacy Policy
- Cookie Policy
- Refund Policy

The same acknowledgement confirms:
- user is 18+, or
- user has permission from a parent/legal guardian.

All four policy names open their corresponding legal page in a new tab.

## Server-side enforcement
The register server action checks `legalConsent`.
A user cannot bypass the checkbox by removing the HTML `required` attribute in the browser.

## Consent version
Current legal version:
`2026-08-30`

## Audit record
A new `legal_consents` table stores:
- user id
- Terms version
- Privacy version
- Cookie version
- Refund version
- age/guardian confirmation
- acceptance timestamp
- source (`registration`)

The auth signup sends the acceptance information in user metadata and a database trigger writes the immutable consent record when the auth user is created.

## Branding cleanup
The registration screen now says `Join BoostingPedia` and uses the current BoostingPedia neutral/green visual system instead of legacy VantaBoost/violet styling.

## Important
Accepting the Cookie Policy during registration does not replace a separate consent mechanism for non-essential analytics/advertising cookies if those technologies are enabled later.
