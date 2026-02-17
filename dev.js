import { spawn } from 'child_process';
import path from 'path';

process.env.NODE_ENV = 'development';

console.log('Starting development server...');

const tsxPath = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
const command = tsxPath.includes(' ') ? `"${tsxPath}"` : tsxPath;

const child = spawn(command, ['server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});


child.on('error', (err) => {
  console.error('Failed to start child process:', err);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});
