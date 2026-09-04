# WhatsApp Task Notifier (Baileys)

Auto-sends a WhatsApp message when a task is assigned, rejected, completed —
whatever event triggers it. This folder lives inside the main `dr-suresh`
repo now, but it's a completely separate, standalone Node.js service — it
doesn't get built/deployed by Vercel along with the website. It runs on
your own computer.

## One-time setup

1. Make sure you have the full `dr-suresh` repo cloned/pulled locally
   (this folder comes with it).
2. Open cmd inside this `whatsapp-notifier` folder specifically and run:
   ```
   npm install
   ```

## Make it auto-start with Windows (do this once)

1. Press `Win + R`, type `shell:startup`, press Enter.
2. Right-click inside that folder -> **New -> Shortcut**.
3. Browse to and select `start-hidden.vbs` inside this folder.
4. Name it anything, e.g. "WhatsApp Notifier" -> Finish.

From now on, every time you log into Windows, the notifier starts
automatically in the background — no window, nothing to run manually.

### Start it right now (without restarting Windows)

Double-click `start-hidden.vbs` directly.

### How to check it's running

Open the admin panel's **WhatsApp** tab in your browser (on this same
computer). If it shows "Notifier not running", double-click
`start-hidden.vbs` again.

### How to stop it

Task Manager (`Ctrl+Shift+Esc`) -> **Details** -> find `node.exe` -> End Task.

## First-time WhatsApp login

1. Make sure the notifier is running.
2. Open the admin panel's **WhatsApp** tab -> click **Generate QR**.
3. On the test phone (7255049328): WhatsApp -> Settings -> Linked Devices
   -> Link a Device -> scan the QR shown in the browser.
4. Tab switches to "Connected" within a couple seconds.

The session is saved in `./auth` (inside this folder) — you only scan
once. **This `auth` folder is git-ignored on purpose** — it holds your
live WhatsApp login session and should never be committed or shared.

## Connecting it to the actual task management app

Wherever that app's backend handles "task assigned" / "task rejected"
events, add an HTTP call — see `example-usage.js`:

```js
fetch('http://localhost:3001/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: '917255049328', message: 'New task assigned!' })
})
```

## Switching to Dr. Suresh's real number later

Everything is wired to test on **7255049328** right now. Once confirmed
working, replace that number wherever it's hardcoded. To have messages
sent *from* Dr. Suresh's own number, he needs to be the one who scans
the QR (delete `./auth` and re-scan with his phone when ready).

## Render free tier & missed reminders

Render's **free** web service plan spins the service down after **15 minutes**
with no incoming request, and only wakes it back up on the next request. The
9 AM cron jobs below run *inside* this same process — if the service happens
to be asleep right at 9:00/9:05/9:10/9:15 AM, that day's reminders/wishes are
silently **skipped** (nothing queues them for later).

**1. Keep the service awake — already handled automatically**

The code now self-pings its own `/status` endpoint every 10 minutes (see the
"Self-ping keep-alive" block near the bottom of `index.js`). This uses
`RENDER_EXTERNAL_URL`, which Render sets automatically — nothing to
configure, nothing to sign up for. As long as this keeps working, the
service never goes idle long enough to sleep, so the 9 AM jobs fire
normally. (This is a well-known community workaround, not something Render
officially guarantees for the free tier — it can occasionally miss a beat.)

**2. A backup that runs the checks directly (covers the rare gap)**

As a safety net for the odd time self-ping misses a beat (a slow/failed
ping, a Render-side restart, etc.), set up one free scheduled task on
[cron-job.org](https://cron-job.org) (or similar) per check, a little
*after* the usual cron time — this both wakes the service and runs the
check if it hasn't already run today:

| Time (IST)  | Method | URL                                                                     |
|-------------|--------|--------------------------------------------------------------------------|
| 9:20 AM     | POST   | `https://dr-suresh-whatsapp.onrender.com/check-appointment-reminders`   |
| 9:25 AM     | POST   | `https://dr-suresh-whatsapp.onrender.com/check-followups`               |
| 9:30 AM     | POST   | `https://dr-suresh-whatsapp.onrender.com/check-birthdays`               |
| 9:35 AM     | POST   | `https://dr-suresh-whatsapp.onrender.com/check-festivals`               |

Each of these calls needs one custom header:
```
X-Cron-Secret: <your CRON_SECRET value>
```

To set this up:
1. Pick any long random string as your secret (e.g. generate one at
   <https://1password.com/password-generator> or just mash the keyboard).
2. In Render's dashboard for this service -> **Environment** -> add
   `CRON_SECRET` = that string -> save (Render will redeploy).
3. In cron-job.org, create the 4 scheduled tasks above, each with that
   `X-Cron-Secret` header set to the same value.

It's safe to run self-ping and this backup together, and safe if the
internal 9 AM cron *and* the backup both end up running on the same day — a
dedup table (`sql/whatsapp_notification_log.sql`, run this once in Supabase
SQL Editor if you haven't) makes sure the same reminder/wish never goes to
the same person twice in one day, no matter how many times a check runs.

**The only 100% guarantee** is a paid Render instance (their cheapest
"Starter" plan) — it never spins down at all, by design. Self-ping + the
backup schedule above get you very close to that for free, but not with an
absolute guarantee.

## Message log (View Log)

The admin panel's WhatsApp tab has a **View Log** view alongside Connection —
it lists the last 200 send attempts (patient, number, message type, and
whether it was sent / failed / skipped, with a reason for failures and
skips). Run `sql/whatsapp_message_log.sql` once in Supabase if you haven't —
every send (manual, from `/notify`, or automatic from the daily/periodic
checks) is now logged there.

## Twice-monthly promotional message (1st and 15th)

Every 1st and 15th at 9:20 AM IST, every **active** patient with a phone
number gets one promotional message (a Sitamarhi-best-clinic line + a
tip/offer). The offer text lives in the `monthly_promo` table (run
`sql/monthly_promo.sql` once in Supabase if you haven't) — to change the
offer, just update that row in Supabase's Table Editor:
```sql
update monthly_promo set message_template = 'your new offer text with {name}' where id = 1;
```
To pause it without deleting anything: `update monthly_promo set active = false where id = 1;`

⚠️ Unlike the other automatic messages, this one is **promotional, not
transactional** — it goes to every active patient whether or not they have
an upcoming appointment. That's a pattern WhatsApp's spam detection watches
more closely (hence the slow pace between sends, same as festival wishes).
Keep the frequency low and the content useful, and watch the WhatsApp tab's
"View Log" after each run for anything that looks off.

## Festival dates (now editable from Supabase)

Festival dates and their WhatsApp wish text used to be hardcoded in
`index.js`. They now live in the `festivals` table (run
`sql/festivals.sql` once in Supabase if you haven't) — to add, fix, or
remove a festival, edit that table directly in Supabase's Table Editor, no
code change or redeploy needed. Columns:
- `month`, `day` — the date to match (1-12, 1-31)
- `year` — leave **empty/NULL** for festivals that repeat every year
  (New Year, Republic Day, Independence Day, Makar Sankranti, Christmas).
  For lunar/lunisolar festivals (Diwali, Holi, Eid, Raksha Bandhan, Chhath,
  etc.) whose Gregorian date changes yearly, set the specific year — add a
  new row with next year's date when it's due.
- `message_template` — the English wish; use the literal text `{name}`
  wherever the patient's name should go.
- `active` — set to `false` to turn a festival off without deleting it.

## Important notes

- Unofficial WhatsApp Web automation — fine for internal/team
  notifications, not for high-volume patient messaging (use the official
  WhatsApp Business API for that).
- Needs **this computer on and logged in** — not cloud-hosted. Ask if you
  want it deployed to an always-on server instead, so it works with no
  local PC dependency.
- If it disconnects and won't reconnect, delete `./auth` and re-scan.

## Automatic post-visit feedback & resolution follow-up (new)

Every time a `patient_consultations` entry is created:
- **5 hours later**, the patient gets a bilingual (Hindi + English) WhatsApp
  message asking for feedback on their visit.
- **7 days later**, they get a follow-up asking whether the problem they
  came in for has been resolved.

Each of these only ever goes out once per entry (tracked via
`feedback_sent_at` / `resolution_followup_sent_at` on that row — run
`sql/patient_consultations_followup_columns.sql` once in Supabase if you
haven't). Unlike the 9 AM checks above, these run every 30 minutes all day,
since "N hours/days after entry" can land at any time.

To trigger either manually right now (for testing):
```bash
curl -X POST https://dr-suresh-whatsapp.onrender.com/check-feedback-requests -H "Authorization: Bearer <admin-token>"
curl -X POST https://dr-suresh-whatsapp.onrender.com/check-resolution-followups -H "Authorization: Bearer <admin-token>"
```

## Automatic follow-up reminders (new)

Every day at **9:00 AM (India time)**, the service automatically checks for
patients whose follow-up date is within the next 2 days, and sends them a
WhatsApp reminder — no admin panel click needed, no one needs to be online.
Each patient only gets reminded once per day (tracked via
`last_reminder_sent_date` on their consultation record).

To trigger this manually right now (for testing, instead of waiting for 9 AM):

```bash
curl -X POST https://dr-suresh-whatsapp.onrender.com/check-followups
```
