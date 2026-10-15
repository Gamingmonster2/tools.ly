/**
 * Tools.ly release publisher for Telegram.
 *
 * Runs on a Cloudflare Cron Trigger. Every run it looks at the site's release feed, picks
 * the oldest tool that has not been announced yet, and posts it to the channel — then
 * records that it did, so nothing is ever announced twice.
 *
 * Secrets (set with `wrangler secret put`, never committed):
 *   TELEGRAM_BOT_TOKEN   the token BotFather gave you
 *   ADMIN_KEY            a long random string, needed to hit /run and /preview
 *
 * Plain vars live in wrangler.jsonc.
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Telegram only accepts these as inline text; anything fancier needs parse_mode. */
const composeMessage = (release) => {
  const hashtag = release.locale === "ar" ? "#أدوات_مجانية" : "#FreeTools";
  return [
    `<b>${escapeHtml(release.title)}</b>`,
    "",
    escapeHtml(release.description),
    "",
    release.url,
    "",
    hashtag,
  ].join("\n");
};

const readState = async (env) => {
  const raw = await env.PUBLISHER_STATE.get("state", "json");
  return raw ?? { posted: [], lastPostAt: null };
};

const writeState = (env, state) =>
  env.PUBLISHER_STATE.put("state", JSON.stringify(state));

const loadFeed = async (env) => {
  const response = await fetch(env.FEED_URL, { cf: { cacheTtl: 0 } });
  if (!response.ok) throw new Error(`feed responded ${response.status}`);
  const feed = await response.json();
  if (!Array.isArray(feed?.releases)) throw new Error("feed has no releases array");
  return feed.releases;
};

const nextRelease = (feed, state) =>
  feed.find((release) => !state.posted.includes(release.id)) ?? null;

const send = async (env, text) => {
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_notification: false,
      }),
    }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok !== true) {
    throw new Error(`Telegram refused the message: ${body.description ?? response.status}`);
  }
  return body.result;
};

const hoursSince = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 36e5 : Infinity);

const status = async (env) => {
  const [feed, state] = await Promise.all([loadFeed(env), readState(env)]);
  const next = nextRelease(feed, state);
  return {
    ok: true,
    feedUrl: env.FEED_URL,
    chatId: env.TELEGRAM_CHAT_ID,
    releases: feed.length,
    posted: state.posted.length,
    lastPostAt: state.lastPostAt,
    hoursSinceLastPost: state.lastPostAt ? Number(hoursSince(state.lastPostAt).toFixed(2)) : null,
    minHoursBetweenPosts: Number(env.MIN_HOURS_BETWEEN_POSTS ?? 48),
    nextUp: next ? { id: next.id, title: next.title, url: next.url } : null,
  };
};

const publish = async (env, { force }) => {
  const [feed, state] = await Promise.all([loadFeed(env), readState(env)]);
  const next = nextRelease(feed, state);

  if (!next) return { ok: true, sent: false, reason: "every release has already been posted" };

  const waited = hoursSince(state.lastPostAt);
  const minimum = Number(env.MIN_HOURS_BETWEEN_POSTS ?? 48);
  if (!force && waited < minimum) {
    return {
      ok: true,
      sent: false,
      reason: `only ${waited.toFixed(1)}h since the last post, the cadence is ${minimum}h`,
      nextUp: next.id,
    };
  }

  const message = composeMessage(next);
  const result = await send(env, message);

  state.posted.push(next.id);
  state.lastPostAt = new Date().toISOString();
  await writeState(env, state);

  return { ok: true, sent: true, id: next.id, title: next.title, messageId: result.message_id };
};

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      publish(env, { force: false })
        .then((outcome) => console.log("publish", JSON.stringify(outcome)))
        .catch((error) => console.error("publish failed", error.message))
    );
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== env.ADMIN_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorised" }), {
        status: 401,
        headers: JSON_HEADERS,
      });
    }

    try {
      if (url.pathname === "/status") {
        return new Response(JSON.stringify(await status(env), null, 2), { headers: JSON_HEADERS });
      }
      if (url.pathname === "/preview") {
        const feed = await loadFeed(env);
        const state = await readState(env);
        const next = nextRelease(feed, state);
        return new Response(
          JSON.stringify(
            { ok: true, nextUp: next?.id ?? null, message: next ? composeMessage(next) : null },
            null,
            2
          ),
          { headers: JSON_HEADERS }
        );
      }
      if (url.pathname === "/run") {
        const outcome = await publish(env, { force: url.searchParams.get("force") === "1" });
        return new Response(JSON.stringify(outcome, null, 2), { headers: JSON_HEADERS });
      }
      return new Response(
        JSON.stringify({ ok: true, endpoints: ["/status", "/preview", "/run?force=1"] }, null, 2),
        { headers: JSON_HEADERS }
      );
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
  },
};
