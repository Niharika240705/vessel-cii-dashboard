module.exports = {
  apps: [
    {
      name: "ais-ingester",
      script: "./src/scripts/ais-ingester.ts",
      interpreter: "node_modules/.bin/ts-node",
      instances: 1, // Only 1 instance needed since it connects to a single websocket stream
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      // Important to specify max restarts and cron restart if memory leaks over days
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};
