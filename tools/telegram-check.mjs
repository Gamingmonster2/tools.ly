/**
 * Telegram diagnostic.
 *
 * Reads credentials from the environment so no secret is ever stored in this file:
 *
 *   $env:TG_TOKEN = "123456:ABC..."
 *   $env:TG_CHAT  = "@toolsly"          # or -1001234567890
 *   node tools/telegram-check.mjs
 *
 * It answers the three questions that actually block a first setup:
 *   1. is the token valid, and what is the bot's real username?
 *   2. can the bot see the channel?
 *   3. can the bot post to it (is it an administrator)?
 */
const token = process.env.TG_TOKEN;
const chat = process.env.TG_CHAT;

if (!token || !chat) {
  console.error("Set TG_TOKEN and TG_CHAT first.");
  process.exit(2);
}

const call = async (method, body) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
};

const line = (label, value) => console.log(`  ${label.padEnd(22)} ${value}`);

console.log("\n1) the token");
const me = await call("getMe");
if (me.body?.ok) {
  line("bot name", me.body.result.first_name);
  line("bot username", `@${me.body.result.username}`);
  line("bot id", me.body.result.id);
  console.log("   → use exactly that username when adding the bot as an administrator");
} else {
  console.log(`   ✗ rejected: ${me.body?.description ?? me.status}`);
  console.log("   → the token is wrong or has a stray space. Get a fresh one from BotFather /mybots.");
  process.exit(1);
}

console.log("\n2) the channel");
const chatInfo = await call("getChat", { chat_id: chat });
if (chatInfo.body?.ok) {
  line("title", chatInfo.body.result.title);
  line("type", chatInfo.body.result.type);
  line("username", chatInfo.body.result.username ? `@${chatInfo.body.result.username}` : "(private)");
  line("members", chatInfo.body.result.members_count ?? "hidden");
} else {
  console.log(`   ✗ ${chatInfo.body?.description ?? chatInfo.status}`);
  console.log("   → check the channel id, or make sure the bot has been added to it.");
}

console.log("\n3) posting permission");
const sent = await call("sendMessage", {
  chat_id: chat,
  text: "اختبار من Tools.ly ✅\nهذه رسالة تجريبية — إن وصلت فقد نجح الربط.",
  disable_notification: false,
});
if (sent.body?.ok) {
  line("message id", sent.body.result.message_id);
  console.log("   ✓ the bot can post to the channel — the pipeline will work");
} else {
  const why = sent.body?.description ?? sent.status;
  line("✗ refused", why);
  if (/rights/i.test(why)) {
    console.log("   → the bot is in the channel but is NOT an administrator.");
    console.log("     Channel → Manage → Administrators → Add Admin → @toolsly_publisher_bot");
  } else if (/chat not found/i.test(why)) {
    console.log("   → the channel id is wrong, or the bot was never added to the channel.");
  } else if (/unauthorized/i.test(why)) {
    console.log("   → the token is wrong.");
  }
}
console.log("");
