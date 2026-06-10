module.exports = {
  apps: [{
    name: 'toxic-v2',
    script: 'index.js',
    interpreter: 'node',
    node_args: '--experimental-specifier-resolution=node'
  }]
};