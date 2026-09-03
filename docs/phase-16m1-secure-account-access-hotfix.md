# Phase 16M.1 — Secure Account Access Hotfix

Root cause:
The active BOOSTINGPEDIA_CREDENTIALS_KEY does not decode to the 32 bytes required by AES-256-GCM.

Production DB check before this hotfix:
order_credentials rows = 0

Therefore the encryption key can safely be rotated before any credentials are stored.

Code hardening:
- trims accidental whitespace
- strips accidental surrounding quotes
- accepts standard Base64
- accepts Base64URL
- accepts a 64-character hex key as fallback
- still requires exactly 32 decoded bytes
- never sends encryption environment-variable names or technical crypto errors to customers
- internal failures are logged server-side and customer gets a generic Secure Account Access message
