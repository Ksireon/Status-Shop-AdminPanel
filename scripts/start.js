const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const envPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) {
      const key = m[1]
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  })
}

const port = process.env.PORT || '3000'
const cmd = process.platform === 'win32' ? 'node_modules\\.bin\\next' : 'node_modules/.bin/next'
const child = spawn(cmd, ['start', '-p', port], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
})

child.on('exit', (code) => process.exit(code || 0))
