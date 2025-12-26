import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
const child = spawn(cmd, ['dev', '-p', port], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
})

child.on('exit', (code) => process.exit(code || 0))
