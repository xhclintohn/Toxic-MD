import { spawn } from 'child_process';
  let _rc = 0;
  function start() {
      const p = spawn(process.execPath, ['index.js'], { stdio: 'inherit' });
      p.on('close', () => {
          _rc++;
          setTimeout(start, Math.min(_rc * 2000, 15000));
      });
  }
  start();
  