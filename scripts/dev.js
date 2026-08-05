const os = require('os');
const { spawn } = require('child_process');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const ip = getLocalIP();

console.log('\x1b[36m%s\x1b[0m', `📱 Mobile: http://${ip}:3000`);
console.log('\x1b[32m%s\x1b[0m', '🚀 Starting server...');
console.log('\x1b[33m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Run Next.js with network binding
const child = spawn('next', ['dev', '-H', '0.0.0.0'], { 
  stdio: 'inherit', 
  shell: true 
});