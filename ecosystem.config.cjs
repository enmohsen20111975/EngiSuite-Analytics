/**
 * PM2 Ecosystem Configuration for Hostinger Deployment
 */

module.exports = {
  apps: [
    {
      name: 'engisuite-analytics',
      script: 'dist/server.js',
      cwd: '/home/your-user/engisuite-nodejs',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:./data/engisuite.db',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8000,
      },
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      // Auto-restart on crash
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
    },
  ],

  deploy: {
    production: {
      user: 'your-ssh-user',
      host: 'your-hostinger-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/engisuite-nodejs.git',
      path: '/home/your-user/engisuite-nodejs',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'apt-get install git -y',
    },
  },
};
