// Local "produce media" step: Gemini TTS (Charon) -> WAV, Whisper -> word-level
// captions, then write props.json for the render. All free, all local.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { transcribe, toCaptions } = require("@remotion/install-whisper-cpp");

const RENDER = __dirname;
const WHISPER = path.join(os.homedir(), "finplaza-whisper");
const env = fs.readFileSync(path.join(RENDER, "..", "infra", ".env"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();

const script =
  "Credit Card ka minimum payment trap! Kya aap bhi har mahine sirf minimum amount pay karte ho? Toh suno, yeh aapko debt ke daldal mein phansa sakta hai! Maan lo, aapka bill hai 30,000 rupaye aur minimum payment hai sirf 1,500 rupaye. Lekin baaki 28,500 rupaye par high interest lagna shuru ho jaata hai. Toh debt kam hone ke bajaye, sirf interest badhta jaayega. Hamesha full outstanding amount pay karein. Minimum payment is a trap, not a solution! Finplaza ko follow karein!";

const onscreen = [
  { t: 7, type: "number", text: "₹30,000", durationInSeconds: 1.8 },
  { t: 13, type: "number", text: "₹28,500", durationInSeconds: 1.8 },
];

const wavBuffer = (pcm, sampleRate) => {
  const ch = 1, bits = 16, byteRate = sampleRate * ch * bits / 8, blockAlign = ch * bits / 8;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(byteRate, 28); h.writeUInt16LE(blockAlign, 32); h.writeUInt16LE(bits, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

const resample = (pcm, fromRate, toRate) => {
  const n = pcm.length / 2;
  const inArr = new Int16Array(pcm.buffer, pcm.byteOffset, n);
  const out = Math.floor((n * toRate) / fromRate);
  const o = new Int16Array(out);
  const step = fromRate / toRate;
  for (let j = 0; j < out; j++) {
    const pos = j * step, i0 = Math.floor(pos), i1 = Math.min(i0 + 1, n - 1), f = pos - i0;
    o[j] = (inArr[i0] * (1 - f) + inArr[i1] * f) | 0;
  }
  return Buffer.from(o.buffer, o.byteOffset, o.byteLength);
};

(async () => {
  // 1. Gemini TTS -> 24kHz PCM
  const text =
    "Read this Hinglish YouTube Short script as an energetic, friendly Indian finance host. Vary your pace: say rupee amounts and key numbers slowly and clearly, deliver short punchy lines fast and lively, and pause a beat before the big reveal. Script: " +
    script;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${KEY}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } } } }) }
  );
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
  if (!part) { console.error("NO AUDIO:", JSON.stringify(j).slice(0, 400)); process.exit(1); }
  const pcm24 = Buffer.from(part.inlineData.data, "base64");
  const seconds = +(pcm24.length / 48000).toFixed(2);

  // 2. save 24kHz WAV for the video
  fs.mkdirSync(path.join(RENDER, "public"), { recursive: true });
  fs.writeFileSync(path.join(RENDER, "public", "finplaza-audio.wav"), wavBuffer(pcm24, 24000));

  // 3. 16kHz copy in a SPACE-FREE folder for whisper.cpp (path-spaces break it)
  const wav16 = path.join(WHISPER, "finplaza-16k.wav");
  fs.writeFileSync(wav16, wavBuffer(resample(pcm24, 24000, 16000), 16000));

  // 4. transcribe -> word-level captions
  const out = await transcribe({
    inputPath: wav16,
    whisperPath: WHISPER,
    whisperCppVersion: "1.5.5",
    model: "base",
    modelFolder: WHISPER,
    tokenLevelTimestamps: true,
    language: "en",
  });
  const { captions: raw } = toCaptions({ whisperCppOutput: out });

  // Whisper mis-hears Hinglish (it leans English), but its WORD TIMINGS track the real
  // speech rhythm (pauses, fast/slow). Force-align: keep the EXACT script words, map them
  // onto Whisper's timing so captions match both the voice AND the words.
  const wWords = raw.filter((c) => /[A-Za-z0-9]/.test(c.text));
  const sWords = script.replace(/\s+/g, " ").trim().split(" ");
  const totalMs = Math.round(seconds * 1000);
  const captions = sWords.map((w, j) => {
    const wi = Math.min(wWords.length - 1, Math.floor((j * wWords.length) / sWords.length));
    const startMs = wWords[wi] ? wWords[wi].startMs : Math.round((j / sWords.length) * totalMs);
    return { text: w, startMs };
  });
  for (let k = 0; k < captions.length; k++) {
    const next = k + 1 < captions.length ? captions[k + 1].startMs : totalMs;
    captions[k].endMs = next > captions[k].startMs ? next : captions[k].startMs + 220;
    captions[k].timestampMs = captions[k].startMs;
    captions[k].confidence = 1;
  }

  // 5. write props for the render
  const props = {
    title: "Credit card minimum payment trap",
    script,
    audioUrl: "finplaza-audio.wav",
    audioDurationInSeconds: seconds,
    captions,
    onscreen,
    brollUrls: [],
    showCryptoDisclaimer: false,
    fps: 30,
  };
  fs.writeFileSync(path.join(RENDER, "props.json"), JSON.stringify(props, null, 2));
  console.log("PREPARED seconds=" + seconds + " words=" + captions.length);
})().catch((e) => { console.error("PREPARE_FAILED:", e && e.message ? e.message : e); process.exit(1); });
