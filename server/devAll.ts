import { spawn } from 'node:child_process';

const commands = [
  process.platform === 'win32'
    ? { name: 'vite', command: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', 'npm.cmd', 'run', 'dev'], shell: false }
    : { name: 'vite', command: 'npm', args: ['run', 'dev'], shell: false },
  { name: 'ai', command: process.execPath, args: ['--experimental-strip-types', 'server/index.ts'], shell: false },
];

const children = commands.map((item) => {
  const child = spawn(item.command, item.args, {
    stdio: 'inherit',
    shell: item.shell,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${item.name}] exited with code ${code}`);
      for (const other of children) {
        if (other !== child && !other.killed) {
          other.kill();
        }
      }
      process.exit(code);
    }
  });

  return child;
});

process.on('SIGINT', () => {
  for (const child of children) {
    child.kill('SIGINT');
  }
  process.exit(0);
});
