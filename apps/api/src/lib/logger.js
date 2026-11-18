// Structured logger. No personal data, keys, or tokens in messages or context.
const write = (level, message, context = {}) => {
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...context })
  const stream = level === 'error' ? process.stderr : process.stdout
  stream.write(`${line}\n`)
}

export const logger = {
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context),
}
