// Local "produce media": ONE whole-script Gemini TTS call (Charon) so the voice
// keeps natural human pacing; Whisper word-timings -> captions that follow that
// pacing (~90% synced); auto-timed ₹ number slams; Pexels topic b-roll. Free.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { transcribe, toCaptions } = require("@remotion/install-whisper-cpp");

const RENDER = __dirname;
const WHISPER = path.join(os.homedir(), "finplaza-whisper");
const env = fs.readFileSync(path.join(RENDER, "..", "infra", ".env"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();
const PEXELS = (env.match(/^PEXELS_API_KEY=(.*)$/m) || [])[1].trim();
// resilient fallback chain across all Gemini keys (each project has its own quota)
const KEYS = [KEY, ...[2, 3, 4, 5, 6, 7].map((i) => (env.match(new RegExp("^GEMINI_API_KEY_" + i + "=(.*)$", "m")) || [])[1]).filter(Boolean).map((s) => s.trim())];
let curKey = 0;

const keywords = ["credit card swipe", "stressed man money", "indian rupee cash", "online shopping payment phone", "calculator finance desk"];

const script =
  "Credit card ka minimum payment trap! Kya aap bhi har mahine sirf minimum amount pay karte ho? Ye aapko debt ke daldal mein phasa sakta hai. Maan lo aapka bill hai ₹30,000, aur minimum payment sirf ₹1,500. Aapko lagta hai payment ho gayi, tension khatam. Lekin baaki ₹28,500 par high interest lagna shuru ho jaata hai. Debt kam hone ke bajaye, interest badhta jaata hai. Isliye hamesha full outstanding pay karo. Minimum payment is a trap, not a solution! Finplaza ko follow karo!";

const wavBuffer = (pcm, sr) => {
  const byteRate = sr * 2;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(byteRate, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

const resample = (pcm, from, to) => {
  const n = pcm.length / 2;
  const inArr = new Int16Array(pcm.buffer, pcm.byteOffset, n);
  const out = Math.floor((n * to) / from);
  const o = new Int16Array(out);
  const step = from / to;
  for (let j = 0; j < out; j++) {
    const pos = j * step, i0 = Math.floor(pos), i1 = Math.min(i0 + 1, n - 1), f = pos - i0;
    o[j] = (inArr[i0] * (1 - f) + inArr[i1] * f) | 0;
  }
  return Buffer.from(o.buffer, o.byteOffset, o.byteLength);
};

async function ttsOnce(text, key) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } } } }) }
  );
  if (r.status === 429) return null;
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
  return part ? Buffer.from(part.inlineData.data, "base64") : null;
}

// resilient: stay on current key, fall back on failure, loop all keys with backoff
async function tts(text) {
  for (let cycle = 0; cycle < 8; cycle++) {
    for (let n = 0; n < KEYS.length; n++) {
      try { const b = await ttsOnce(text, KEYS[curKey % KEYS.length]); if (b && b.length > 1500) return b; } catch (e) {}
      curKey++;
      await new Promise((r) => setTimeout(r, 400));
    }
    await new Promise((r) => setTimeout(r, 2500 * (cycle + 1)));
  }
  throw new Error("tts failed after looping all keys");
}

(async () => {
  // 1. ONE whole-script TTS call -> natural human pacing
  const speak = script.replace(/₹(\d[\d,]*\d|\d)/g, "$1 rupaye");
  const prompt =
    "Read this Hinglish YouTube Short script as an energetic, friendly Indian finance host. Speak like a real human: pause naturally at commas and full stops, slow down and stress the rupee amounts and key numbers, and deliver the punchy one-liners faster. Script: " + speak;
  const pcm = await tts(prompt);
  const seconds = +(pcm.length / 48000).toFixed(2);
  fs.mkdirSync(path.join(RENDER, "public"), { recursive: true });
  fs.writeFileSync(path.join(RENDER, "public", "finplaza-audio.wav"), wavBuffer(pcm, 24000));

  // 2. Whisper word-timings (16kHz copy in a space-free folder)
  const wav16 = path.join(WHISPER, "finplaza-16k.wav");
  fs.writeFileSync(wav16, wavBuffer(resample(pcm, 24000, 16000), 16000));
  const out = await transcribe({ inputPath: wav16, whisperPath: WHISPER, whisperCppVersion: "1.5.5", model: "base", modelFolder: WHISPER, tokenLevelTimestamps: true, language: "en" });
  const { captions: raw } = toCaptions({ whisperCppOutput: out });

  // 3. force-align: exact script words onto Whisper's real timings (follows the pacing)
  const wWords = raw.filter((c) => /[A-Za-z0-9]/.test(c.text));
  const sWords = script.replace(/\s+/g, " ").trim().split(" ");
  const totalMs = Math.round(seconds * 1000);
  const captions = sWords.map((w, j) => {
    const wi = Math.min(wWords.length - 1, Math.floor((j * wWords.length) / sWords.length));
    return { text: w, startMs: wWords[wi] ? wWords[wi].startMs : Math.round((j / sWords.length) * totalMs) };
  });
  const onscreen = [];
  for (let k = 0; k < captions.length; k++) {
    const next = k + 1 < captions.length ? captions[k + 1].startMs : totalMs;
    captions[k].endMs = next > captions[k].startMs ? next : captions[k].startMs + 200;
    captions[k].timestampMs = captions[k].startMs;
    captions[k].confidence = 1;
    const amt = captions[k].text.match(/₹\d[\d,]*\d/);
    if (amt) onscreen.push({ t: captions[k].startMs / 1000, type: "number", text: amt[0], durationInSeconds: 1.7 });
  }

  // 4. topic b-roll from Pexels
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
