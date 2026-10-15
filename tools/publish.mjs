/**
 * Tools.ly publisher.
 *
 * Posts one tool at a time to the Telegram channel, oldest first, and remembers what it
 * has already posted so nothing is ever announced twice. Runs from GitHub Actions on a
 * schedule, and can be run by hand for a dry run.
 *
 *   node tools/publish.mjs --dry     show what would be posted, send nothing
 *   node tools/publish.mjs           post the next tool
 *   node tools/publish.mjs --force   ignore the cadence and post now
 *
 * Credentials come from the environment (GitHub repository secrets), never from a file:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const STATE_FILE = join(root, ".publish-state.json");
const FEED_URL = process.env.FEED_URL ?? "https://tools.ly/feed/releases.json";
const MIN_HOURS = Number(process.env.MIN_HOURS_BETWEEN_POSTS ?? 48);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const force = args.includes("--force");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chat = process.env.TELEGRAM_CHAT_ID;

/** One emoji per category, so a post is recognisable in a crowded feed. */
const CATEGORY_EMOJI = {
  text: "✍️",
  time: "🗓️",
  math: "🧮",
  convert: "🔁",
  color: "🎨",
  media: "🖼️",
  dev: "💻",
  privacy: "🔐",
  health: "❤️",
  fun: "🎮",
  files: "📄",
  fonts: "🔤",
  religion: "🕌",
};

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The post itself. It leads with what the tool does for you, not with the fact that it is
 * new — nobody clicks "we launched a tool".
 */
const composeMessage = (release) => {
  const emoji = CATEGORY_EMOJI[release.category] ?? "🔧";
  const hashtag = release.locale === "ar" ? "#أدوات_مجانية" : "#FreeTools";
  return [
    `${emoji} <b>${escapeHtml(release.title)}</b>`,
    "",
    escapeHtml(release.description),
    "",
    `👉 ${release.url}`,
    "",
    hashtag,
  ].join("\n");
};

const readState = () => {
  if (!existsSync(STATE_FILE)) return { posted: [], lastPostAt: null };
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    return {
      posted: Array.isArray(parsed.posted) ? parsed.posted : [],
      lastPostAt: parsed.lastPostAt ?? null,
    };
  } catch {
    console.warn("state file is unreadable, starting a fresh one");
    return { posted: [], lastPostAt: null };
  }
};

const writeState = (state) => writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);

const loadFeed = async () => {
  const response = await fetch(FEED_URL, { headers: { "user-agent": "toolsly-publisher/1.0" } });
  if (!response.ok) throw new Error(`feed responded ${response.status} at ${FEED_URL}`);
  const feed = await response.json();
  if (!Array.isArray(feed?.releases)) throw new Error("feed has no releases array");
  return feed.releases;
};

const hoursSince = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 36e5 : Infinity);

const send = async (text) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: false },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok !== true) {
    throw new Error(`Telegram refused the message: ${body.description ?? response.status}`);
  }
  return body.result;
};

const main = async () => {
  if (!dryRun && (!token || !chat)) {
    console.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must both be set.");
    process.exit(2);
  }

  const feed = await loadFeed();
  const state = readState();
  const pending = feed.filter((release) => !state.posted.includes(release.id));

  console.log(`feed: ${feed.length} releases · already posted: ${state.posted.length} · pending: ${pending.length}`);

  if (pending.length === 0) {
    console.log("nothing left to post — every release has been announced");
    return;
  }

  const next = pending[0];
  const message = composeMessage(next);

  console.log(`\nnext up: ${next.id}  (published ${next.published})\n${"-".repeat(60)}\n${message}\n${"-".repeat(60)}`);

  if (dryRun) {
    console.log("\n--dry: nothing was sent and the state file was not touched");
    return;
  }

  const waited = hoursSince(state.lastPostAt);
  if (!force && waited < MIN_HOURS) {
    console.log(
      `\nskipped: only ${waited.toFixed(1)}h since the last post and the cadence is ${MIN_HOURS}h. Use --force to override.`
    );
    return;
  }

  const result = await send(message);
  state.posted.push(next.id);
  state.lastPostAt = new Date().toISOString();
  writeState(state);

  console.log(`\n✓ posted "${next.title}" — telegram message id ${result.message_id}`);
};

main().catch((error) => {
  console.error(`publish failed: ${error.message}`);
  process.exit(1);
});
