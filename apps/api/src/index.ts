import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import { env } from './config/env'
import { authRouter } from './modules/auth/auth.router'
import { listingsRouter } from './modules/listings/listings.router'
import { farmerRouter } from './modules/farmer/farmer.router'
import { userRouter } from './modules/user/user.router'
import { bookingsRouter } from './modules/bookings/bookings.router'
import { aiRouter } from './modules/ai/ai.router'
import { adminRouter } from './modules/admin/admin.router'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.NODE_ENV === 'production' ? [env.FRONTEND_URL] : [env.FRONTEND_URL],
  credentials: true,
}))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() })
)

app.use('/v1/auth', authRouter)
app.use('/v1/listings', listingsRouter)
app.use('/v1/farmer', farmerRouter)
app.use('/v1/users', userRouter)
app.use('/v1/bookings', bookingsRouter)
app.use('/v1/ai', aiRouter)
app.use('/v1/admin', adminRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.info(`\n🌾  Khetly API`)
  console.info(`   → http://localhost:${env.PORT}`)
  console.info(`   → Health: http://localhost:${env.PORT}/health`)
  console.info(`   → Env: ${env.NODE_ENV}\n`)
})

export default app
