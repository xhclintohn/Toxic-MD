const data = {
  "conversation": "Haii"
};
const revive = (x) => Array.isArray(x) ? x.map(revive) : (x && typeof x === "object") ? (typeof x.__b64__ === "string" ? Buffer.from(x.__b64__, "base64") : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, revive(v)]))) : x;
export default async (context) => {
    const { client, m } = context;
    await client.sendJson(m.chat, revive(data));
};