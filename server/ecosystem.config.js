module.exports = {
  apps: [
    {
      name: "kodewords",
      script: "./dist/index.js",
      cwd: "/home/ubuntu/kodewords/server",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      error_file: "/home/ubuntu/kodewords/logs/error.log",
      out_file: "/home/ubuntu/kodewords/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
