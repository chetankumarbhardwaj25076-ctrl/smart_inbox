# Smart Inbox — AI opportunity manager for college email

One inbox, one dashboard, no missed deadline. The app reads announcement emails (Gmail or built-in sample emails), pulls out the deadline, eligibility, fees, documents and links, checks them against your profile, and shows everything as a dated list, a three-week runway, a calendar, a task list and a daily digest.

## Run it (2 minutes)

```bash
pip install -r requirements.txt     # starlette, uvicorn, cryptography
python run.py                       # then open http://localhost:8000
```

(`start.sh` / `start.bat` do both steps.) On first launch, answer the short profile questions and click **Try with sample emails**. That works with no accounts or keys.

## Connect your real Gmail

The app uses Google OAuth 2.0 with PKCE and the **read-only** Gmail scope. It never sees your password and cannot send, change or delete mail.

**Easiest way:** open the app, go to **Settings → Set up Google sign-in**. It shows these steps with links, a copy button for the redirect URI, and a form where you paste the client ID and secret (saved to `.env` on your computer, never sent back to the browser). The manual steps are:

1. Open the [Google Cloud Console](https://console.cloud.google.com/), create a project, and enable the **Gmail API**.
2. **OAuth consent screen**: choose *External*, fill in the app name and your email, keep it in *Testing*, and add your own Gmail address under *Test users*.
3. **Credentials → Create credentials → OAuth client ID → Web application**. Add this *Authorized redirect URI* exactly: `http://localhost:8000/auth/google/callback`
4. Paste the client ID and secret into the Settings form (or copy `.env.example` to `.env` and fill them in, then restart).
5. Settings → **Connect Gmail**. Google will warn that the app is unverified (it is your own project); choose *Continue*.

Notes
- Apps in *Testing* mode get refresh tokens that Google expires after about 7 days. Just reconnect. Publishing the app for other people requires Google's verification because `gmail.readonly` is a restricted scope.
- New mail is checked every 30 minutes (`AUTO_SYNC_MINUTES`) and on **Check inbox**.

## What's in the interface

- **Homepage** with a live example of an email becoming a record. Opens first until you've read some emails; the brand name in the sidebar returns to it.
- **Overview**: digest summary, a three-week deadline strip, what needs attention, recently found.
- **Opportunities**: search (`/` focuses it), category chips, eligibility and deadline filters, sorting, **List or Cards** layout, **Export CSV**. Open any item to see facts, reasons, flags, tasks and source emails, or edit details.
- **Calendar** (with .ics export), **Tasks**, **Daily digest**, **Inbox log**, **Settings** (profile, Google setup, AI key, sample data, privacy).
- Light and dark themes follow your system; the layout works on phones.

## How reading works

1. **Gmail fetch** — lists recent messages, downloads only ones not seen before, turns HTML into text.
2. **Classify** — hackathon, internship, scholarship, research, workshop, assignment, exam, club, or "no action" (promotions, OTPs, newsletters).
3. **Extract** — deadline (with time), event dates, venue, eligible years/branches/courses, CGPA, team size, fee, benefits, documents, steps, registration link, action items. Anything not written in the email stays empty and is flagged, never guessed.
4. **Validate** — odd dates, deadlines before event dates, missing links, shortened URLs, assumed years.
5. **Match** — compares with your profile and explains each verdict (*likely / possibly / likely ineligible / unclear*).
6. **De-duplicate** — forwards, reminders and "deadline extended" follow-ups merge into one record that keeps every source email; a changed deadline raises an alert.
7. **Remind** — in-app alerts at your reminder window, 3 days, 1 day and the day itself; optional daily digest by email.

The rule-based reader runs offline. For harder wording, set `ANTHROPIC_API_KEY` or point `LLM_BASE_URL` at any OpenAI-compatible server (e.g. Ollama). The model only returns JSON that is validated before saving, links it invents are dropped, and emails that look like prompt injection never reach it.

## Privacy and safety

- Read-only Gmail scope; tokens encrypted on disk (Fernet); full email bodies are **not** stored, only extracted fields plus a 280-character snippet.
- Email text is untrusted: rendered as plain text only, links must be http(s), instructions inside emails are ignored (and flagged).
- The app never applies, replies, pays or sends on your behalf.
- Settings → **Disconnect** revokes Google access and removes Gmail data; **Delete all my data** wipes everything.
- Local single-user app: it listens on 127.0.0.1 only, blocks cross-site writes, and sets a strict Content-Security-Policy. Do not expose it to the internet as is.

## Project layout

```
backend/   app.py (API) · gmail.py (OAuth + fetch) · extractor.py · llm.py · eligibility.py
           dedupe.py · pipeline.py · queries.py (filters, digest, reminders) · db.py · samples.py
frontend/  index.html · app.css · app.js   (no build step; all email text is rendered as plain text)
tests/     python -m unittest discover -s tests -v
```

## Notes on the stack

The proposal names FastAPI. This version is built directly on Starlette (the ASGI toolkit FastAPI is built on), which keeps installs tiny and runs with `uvicorn` unchanged. Routes are plain functions, so moving to FastAPI later is a mechanical change. SQLite is used for the prototype; moving to PostgreSQL means swapping `db.py` and adding real user accounts for a multi-user deployment.

## Not built yet (from the proposal's roadmap)

PDF/attachment reading, Outlook, natural-language search, team formation. Attachments are detected and flagged so you know details may be missing.
