// Local "produce media": phrase-by-phrase Gemini TTS (Charon) so caption timing is
// EXACT, auto-timed number slams where amounts are spoken, + Pexels topic b-roll. Free.
const fs = require("fs");
const path = require("path");

const RENDER = __dirname;
const env = fs.readFileSync(path.join(RENDER, "..", "infra", ".env"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();
const PEXELS = (env.match(/^PEXELS_API_KEY=(.*)$/m) || [])[1].trim();

// rotate across ALL Gemini keys (each project has its own TTS quota)
const KEYS = [KEY, ...[2, 3, 4, 5, 6].map((i) => (env.match(new RegExp("^GEMINI_API_KEY_" + i + "=(.*)$", "m")) || [])[1]).filter(Boolean).map((s) => s.trim())];
let keyIdx = 0;

const keywords = ["credit card swipe", "stressed man money", "indian rupee cash", "online shopping payment phone", "calculator finance desk"];

const script =
  "Credit card ka minimum payment trap! Kya aap bhi har mahine sirf minimum amount pay karte ho? Ye aapko debt ke daldal mein phasa sakta hai. Maan lo aapka bill hai ₹30,000, aur minimum payment sirf ₹1,500. Aapko lagta hai payment ho gayi. Lekin baaki ₹28,500 par high interest lagna shuru ho jaata hai. Debt kam hone ke bajaye, interest badhta jaata hai. Isliye hamesha full outstanding pay karo. Minimum payment is a trap, not a solution! Finplaza ko follow karo!";

const SR = 24000;
const BYTE_RATE = SR * 2; // mono 16-bit

const wavBuffer = (pcm) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(BYTE_RATE, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

const silence = (ms) => Buffer.alloc(Math.round((ms / 1000) * BYTE_RATE));

async function ttsOnce(text, key) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } } } }) }
  );
  if (r.status === 429) return null; // quota on this key; rotate
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
  return part ? Buffer.from(part.inlineData.data, "base64") : null;
}

// rotate keys + retry (each key has its own quota; preview TTS is occasionally flaky)
async function tts(speak) {
  const styled = "Energetic Hinglish Indian finance host, clear and punchy: " + speak;
  for (let attempt = 0; attempt < KEYS.length * 2 + 2; attempt++) {
    const text = attempt < KEYS.length ? styled : speak; // styled first pass, raw after
    const key = KEYS[keyIdx++ % KEYS.length];
    try { const b = await ttsOnce(text, key); if (b && b.length > 1500) return b; } catch (e) {}
    await new Promise((res) => setTimeout(res, 500));
  }
  throw new Error("tts failed (all keys exhausted?): " + speak.slice(0, 50));
}

// split into short phrases (sentence enders, then commas, then ~8-word chunks)
// build coherent 5-10 word chunks: break at clause ends (. ! ? ,) with >=5 words,
// or at 10 words; never leave a tiny fragment (TTS rejects those).
function phrases(text) {
  const words = text.split(/\s+/);
  const out = [];
  let buf = [];
  for (const w of words) {
    buf.push(w);
    if ((/[.!?,]$/.test(w) && buf.length >= 9) || buf.length >= 14) {
      out.push(buf.join(" "));
      buf = [];
    }
  }
  if (buf.length) {
    if (buf.length < 4 && out.length) out[out.length - 1] += " " + buf.join(" ");
    else out.push(buf.join(" "));
  }
  return out;
}

(async () => {
  let pcm = Buffer.alloc(0);
  const captions = [];
  const onscreen = [];

  for (const phrase of phrases(script)) {
    const startMs = Math.round((pcm.length / BYTE_RATE) * 1000);
    const speak = phrase.replace(/₹(\d[\d,]*\d|\d)/g, "$1 rupaye"); // ₹ reads cleanly
    const clip = await tts(speak);
    pcm = Buffer.concat([pcm, clip, silence(140)]);
    const endMs = Math.round((pcm.length / BYTE_RATE) * 1000);

    // distribute this phrase's words across its exact [startMs, endMs] by length
    const words = phrase.split(/\s+/);
    const weights = words.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = startMs;
    words.forEach((w, i) => {
      const ws = acc;
      const we = acc + (weights[i] / total) * (endMs - startMs - 140);
      captions.push({ text: w, startMs: Math.round(ws), endMs: Math.round(we), timestampMs: Math.round(ws), confidence: 1 });
      acc = we;
      const amt = w.match(/₹\d[\d,]*\d/);
      if (amt) onscreen.push({ t: ws / 1000, type: "number", text: amt[0], durationInSeconds: 1.7 });
    });
  }

  const seconds = +(pcm.length / BYTE_RATE).toFixed(2);
  fs.mkdirSync(path.join(RENDER, "public"), { recursive: true });
  fs.writeFileSync(path.join(RENDER, "public", "finplaza-audio.wav"), wavBuffer(pcm));

  // topic b-roll from Pexels
  const brollUrls = [];
  for (let i = 0; i < keywords.length; i++) {
    try {
      const sj = await (await fetch("https://api.pexels.com/videos/search?query=" + encodeURIComponent(keywords[i]) + "&orientation=portrait&per_page=6&size=medium", { headers: { Authorization: PEXELS } })).json();
      const v = (sj.videos || []).find((x) => (x.video_files || []).some((f) => f.height > f.width));
      if (!v) continue;
      const file = v.video_files.filter((f) => f.height > f.width).sort((a, b) => Math.abs(a.height - 1280) - Math.abs(b.height - 1280))[0];
      fs.writeFileSync(path.join(RENDER, "public", "broll-" + i + ".mp4"), Buffer.from(await (await fetch(file.link)).arrayBuffer()));
      brollUrls.push("broll-" + i + ".mp4");
    } catch (e) { console.error("broll fail:", keywords[i], e.message); }
  }

  fs.writeFileSync(path.join(RENDER, "props.json"), JSON.stringify({
    title: "Credit card minimum payment trap",
    script, audioUrl: "finplaza-audio.wav", audioDurationInSeconds: seconds,
    captions, onscreen, brollUrls, showCryptoDisclaimer: false, fps: 30,
  }, null, 2));
  console.log("PREPARED seconds=" + seconds + " words=" + captions.length + " numbers=" + onscreen.length + " broll=" + brollUrls.length);
})().catch((e) => { console.error("PREPARE_FAILED:", e && e.message ? e.message : e); process.exit(1); });
