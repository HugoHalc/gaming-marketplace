# Phase 16D — Live Order Chat + Secure Account Access

This phase introduces real backend functionality.

## Adds

- `booster` profile role
- one active booster assignment per order
- order-scoped persistent chat
- chat read state
- server-side moderation term detection
- moderation flag records
- encrypted order account credentials
- explicit credential reveal
- admin assignment API foundation

## Authorization

Order workspace access is limited to:

- customer who owns the order
- assigned active booster
- admin

Only the customer owner can create/update account credentials.

The customer, assigned booster and admin can explicitly reveal saved credentials because they are authorized order participants.

## Credential encryption

Credentials are encrypted in the application server with:

- AES-256-GCM
- random 12-byte IV per save
- authentication tag
- versioned encryption metadata

The database never stores the game account email or password in plaintext.

Required environment variable:

`BOOSTINGPEDIA_CREDENTIALS_KEY`

It must be a Base64 encoded 32-byte random key.

Generate locally with Node:

`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

Add the resulting value to local `.env.local` and Vercel environment variables.

Never commit the actual key to Git.

## Chat moderation

Messages are not automatically blocked.

If text contains one or more configured risk terms such as Discord, WhatsApp, Telegram or PayPal:

- the message is stored
- it is marked flagged
- detected terms are stored
- an `order_moderation_flags` record is created for later admin review

This is a moderation alert foundation, not an automatic guilt/ban system.

## Realtime behavior

The customer UI polls the order conversation every 3 seconds.

This provides near-live conversation without requiring an additional websocket integration in this phase.

A future phase can migrate the same data model to Supabase Realtime without changing message ownership semantics.

## Deferred to Phase 16E

- identity verification
- integrity-validation workflow
- start screenshot upload
- final screenshot upload
