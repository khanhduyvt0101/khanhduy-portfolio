# Archived Infisical binding

The app-specific `.infisical.json` and Infisical project are retained for archives
only. Website public/test/deployment configuration now belongs to Cloudflare
Variables; see [the current client configuration contract](cloudflare.md).
Do not invoke the Infisical CLI for these client profiles or use it as a fallback.
Backend services continue to keep their secrets in Infisical unchanged.
