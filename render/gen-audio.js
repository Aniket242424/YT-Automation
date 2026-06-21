// One-shot: generate the Finplaza voice (Gemini TTS, Charon) -> public/finplaza-audio.wav
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "..", "infra", ".env"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();

const script =
  "Credit Card ka minimum payment trap! Kya aap bhi har mahine sirf minimum amount pay karte ho? Toh suno, yeh aapko debt ke daldal mein phansa sakta hai! Maan lo, aapka bill hai 30,000 rupaye aur minimum payment hai sirf 5 percent, yaani 1,500 rupaye. Aapko lagta hai ki aapne payment kar di aur tension khatam. Lekin asal mein, baaki 28,500 rupaye par high interest lagna shuru ho jaata hai. Toh debt kam hone ke bajaye, sirf interest badhta jaayega. Hamesha full outstanding amount pay karein. Remember, minimum payment is a trap, not a solution! Aur aisi hi financial gyaan ke liye, Finplaza ko follow karein!";

const text =
  "Read this Hinglish YouTube Short script as an energetic, friendly Indian finance host. Vary your pace for impact: say rupee amounts and key numbers slowly and clearly, deliver short punchy lines fast and lively, and pause a beat before the big reveal. Script: " +
  script;

const body = {
  contents: [{ parts: [{ text }] }],
  generationConfig: {
    responseModalities: ["AUDIO"],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
  },
};

(async () => {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${KEY}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
  );
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
  if (!part) {
    console.error("NO AUDIO:", JSON.stringify(j).slice(0, 500));
    process.exit(1);
  }
  const pcm = Buffer.from(part.inlineData.data, "base64");
  const sr = 24000, ch = 1, bits = 16, byteRate = sr * ch * bits / 8, blockAlign = ch * bits / 8;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(byteRate, 28); h.writeUInt16LE(blockAlign, 32); h.writeUInt16LE(bits, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  const wav = Buffer.concat([h, pcm]);
  fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "public", "finplaza-audio.wav"), wav);
  console.log("SECONDS=" + (pcm.length / byteRate).toFixed(2));
})();
