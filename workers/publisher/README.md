# Telegram release publisher

Posts one tool at a time to the Tools.ly Telegram channel, on a schedule, without repeats.

```
src/data/tools.ts + src/data/arTools.ts
        │  (astro build)
        ▼
/feed/releases.json ──────────────► Cloudflare Worker (cron, daily 07:00 UTC)
                                          │
                                          ├─ reads the feed
                                          ├─ picks the oldest tool not yet announced
                                          ├─ checks the cadence (default: one post / 48h)
                                          ├─ posts to Telegram
                                          └─ records it in KV so it never repeats
```

## What you need before deploying

| Thing | Where to get it |
| --- | --- |
| Telegram bot token | BotFather → `/mybots` → your bot → API Token |
| Channel id | already set to `-1004376248040` in `wrangler.jsonc` |
| Cloudflare account | the same one hosting the site |
| Node 20+ | to run `wrangler` |

## Deploy, in order

```bash
cd workers/publisher
npm install -g wrangler        # or use npx wrangler

# 1. sign in to Cloudflare (opens a browser once)
npx wrangler login

# 2. create the KV namespace that stores what has been posted
npx wrangler kv namespace create PUBLISHER_STATE
#    → copy the printed id into "kv_namespaces[0].id" in wrangler.jsonc

# 3. store the two secrets (each prompts for the value, nothing is echoed)
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put ADMIN_KEY          # any long random string you invent

# 4. deploy
npx wrangler deploy
```

## Verify it works, step by step

Replace `KEY` with the `ADMIN_KEY` you invented and `WORKER` with the URL
`wrangler deploy` prints (something like `toolsly-publisher.<account>.workers.dev`).

```bash
# a) does it see the feed and the channel?
curl "https://WORKER/?key=KEY/status"

# b) what would the next post look like? (nothing is sent)
curl "https://WORKER/?key=KEY/preview"

# c) post it now, ignoring the cadence
curl "https://WORKER/?key=KEY/run?force=1"
```

If `a` reports `releases: 41` and a `nextUp`, and `c` returns `"sent": true` and the message
appears in your channel, the pipeline is live. The cron trigger then continues on its own.

## Common failures

| Symptom | Cause |
| --- | --- |
| `Unauthorized` from Telegram | wrong bot token, or a stray space when pasting it |
| `chat not found` | wrong channel id, or the bot is not in the channel |
| `not enough rights to send text messages` | the bot is a member but not an **administrator** of the channel |
| `feed responded 404` | the site has not been deployed with `/feed/releases.json` yet |
| Nothing happens on schedule | the cron is in UTC; check `npx wrangler deployments list` |

## Tuning the drip

- **Cadence** — `MIN_HOURS_BETWEEN_POSTS` in `wrangler.jsonc`. `48` is one post every two days.
- **Order** — the script always takes the *oldest* unannounced tool, so the archive is
  walked in publication order automatically.
- **Restart a run** — clear the `state` key in KV and everything becomes unannounced again.
- **Add a platform** — X, Pinterest and friends plug in beside `send()`; each needs its own
  credential secret. Add them one at a time and measure before adding the next.
