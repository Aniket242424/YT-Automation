import { Config } from "@remotion/cli/config";

// Phase 6 — render config. Headless Chromium on the EC2 box needs these flags
// to survive in a low-RAM container; --no-sandbox is required as root in Docker.
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(2); // t3.medium has 2 vCPU; keep renders from OOMing
Config.setChromiumOpenGlRenderer("angle");
Config.overrideWebpackConfig((config) => config);
