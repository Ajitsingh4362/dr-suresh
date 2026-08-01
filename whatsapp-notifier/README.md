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

## Important notes

- Unofficial WhatsApp Web automation — fine for internal/team
  notifications, not for high-volume patient messaging (use the official
  WhatsApp Business API for that).
- Needs **this computer on and logged in** — not cloud-hosted. Ask if you
  want it deployed to an always-on server instead, so it works with no
  local PC dependency.
- If it disconnects and won't reconnect, delete `./auth` and re-scan.

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
