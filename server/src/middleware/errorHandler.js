/**
 * Global error handler.
 * Logs the error server-side but returns a safe response to the client.
 * Never exposes stack traces, credentials, or internal details.
 */
export function errorHandler(err, _req, res, _next) {
  console.error(`[ERROR] ${err.message}`);

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
