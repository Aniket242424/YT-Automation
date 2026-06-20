// pm2 process file so the render worker self-heals on crash/reboot (Phase 6).
//   npx pm2 start ecosystem.config.js
//   npx pm2 save && npx pm2 startup   # survive reboots
module.exports = {
  apps: [
    {
      name: "render",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      max_memory_restart: "1500M", // restart before headless Chromium OOMs the box
      env: {
        RENDER_PORT: 4000,
        AWS_REGION: "ap-south-1",
        ASSETS_BUCKET: "yourbrand-assets",
      },
    },
  ],
};
