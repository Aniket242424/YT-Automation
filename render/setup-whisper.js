// One-time: install whisper.cpp + a multilingual model for word-level caption timing.
// NOTE: install to a SPACE-FREE path — Remotion's installer doesn't quote Windows paths,
// and this project lives under "Aniket Latest\My YT Automation" (spaces break Expand-Archive).
const { installWhisperCpp, downloadWhisperModel } = require("@remotion/install-whisper-cpp");
const path = require("path");
const os = require("os");

const to = path.join(os.homedir(), "finplaza-whisper");
// the installer downloads its temp zip into process.cwd() and Expand-Archive can't
// handle the spaces in this project path, so run everything from a space-free cwd.
process.chdir(os.homedir());

(async () => {
  await installWhisperCpp({ to, version: "1.5.5", printOutput: true });
  await downloadWhisperModel({ model: "base", folder: to, printOutput: true });
  console.log("WHISPER_READY:" + to);
})().catch((e) => { console.error("WHISPER_SETUP_FAILED:", e && e.message ? e.message : e); process.exit(1); });
