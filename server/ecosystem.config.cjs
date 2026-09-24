module.exports = {
  apps: [
    {
      name: "kodewords",
      script: "/home/ubuntu/games/kodewords/index.mjs",
      cwd: "/home/ubuntu/games/kodewords/",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },

      error_file: "/home/ubuntu/games/kodewords/logs/error.log",
      out_file: "/home/ubuntu/games/kodewords/logs/out.log",

      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
