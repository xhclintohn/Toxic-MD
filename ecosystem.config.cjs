module.exports = {
  apps: [{
    name: 'toxic-v2',
    script: 'index.js',
    interpreter: 'node',
    node_args: '--experimental-specifier-resolution=node',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: '/dev/null',
    out_file: '/dev/null',
    log_file: '/dev/null',
    merge_logs: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
