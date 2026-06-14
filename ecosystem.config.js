// PM2 Ecosystem Configuration
// 使用: pm2 start ecosystem.config.js
// 文档: https://pm2.keymetrics.io/docs/usage/application-declaration/

export default {
  apps: [
    {
      name: 'zhiyu-api',
      // Node 22+ required for --experimental-strip-types
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--experimental-strip-types --env-file=.env.server',
      cwd: '/opt/zhiyu-recruiting',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8787,
      },
      // Restart if memory exceeds 512MB
      max_memory_restart: '512M',
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/zhiyu/api-error.log',
      out_file: '/var/log/zhiyu/api-out.log',
      merge_logs: true,
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Health check
      wait_ready: false,
      listen_timeout: 5000,
    },
  ],
};
