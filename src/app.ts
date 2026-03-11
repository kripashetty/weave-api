// TODO: Bootstrap the Fastify application and register all plugins and routes.
//
// Startup sequence:
//   1. Import config (triggers env var validation — exits on invalid config)
//   2. Build the Fastify instance with pino logger
//   3. Register global plugins:
//      - @fastify/helmet  — security headers
//      - @fastify/cors    — configured to allow weave-web origin only
//      - @fastify/rate-limit — global rate limit (100 req/min per IP, configurable)
//   4. Register the global error handler:
//      - Maps AppError.statusCode to HTTP status
//      - Logs error with context using request.log
//      - Returns consistent error shape: { error: { code, message } }
//   5. Register module routes with their prefix:
//      - authRoutes    → /auth
//      - familyRoutes  → /family
//      - goalsRoutes   → /goals
//      - financesRoutes → /finances
//      - calendarRoutes → /calendar
//      - insightsRoutes → /insights
//      - taxRoutes     → /tax  (V2 — registered but handlers are stubs)
//   6. Start listening on config.PORT
//   7. Handle SIGTERM gracefully — close DB connections, drain in-flight requests
//
// Health check endpoint: GET /health → { status: 'ok', version: pkg.version }
// This endpoint is unauthenticated and used by the ECS health check.

import Fastify from 'fastify'

// TODO: implement full application bootstrap
const app = Fastify({
  logger: true,
})

const start = async (): Promise<void> => {
  try {
    // TODO: register plugins, routes, error handler
    await app.listen({ port: 3001, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()
