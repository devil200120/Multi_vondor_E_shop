module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'PRODUCTION',
        PORT: 8000,
        FRONTEND_URL: 'https://samrudhigroup.in'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'socket',
      script: './socket/index.js',
      env: {
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    },
    {
      name: 'frontend',
      script: 'npx',
      args: 'serve -s build -l 3000',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};