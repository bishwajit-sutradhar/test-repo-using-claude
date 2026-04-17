import 'dotenv/config'   // must be first — loads .env before envalid reads process.env
import app from './app'
import { env } from './config/env'

app.listen(env.PORT, () => {
  console.log(`[server] Running on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  console.log(`[server] LLM provider: ${env.LLM_PROVIDER}`)
})
