// core/src/logging/middleware.js

function getClientIP(request) {
  return request.headers.get('cf-connecting-ip') ||
         request.headers.get('x-real-ip') ||
         request.headers.get('x-forwarded-for') ||
         'unknown';
}

const initLogsTable = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      duration INTEGER NOT NULL,
      status_code INTEGER,
      user_agent TEXT,
      ip TEXT,
      referer TEXT,
      country TEXT,
      error TEXT,
      user_id INTEGER,
      session_id TEXT,
      request_size INTEGER,
      response_size INTEGER
    )
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_request_logs_ip ON request_logs(ip)
  `).run();
};

export const logRequest = async (request, response, env, options = {}) => {
  try {
    const duration = Date.now() - request.timing.startTime;
    const analytics = request.analytics || {};

    const responseSize = response.headers.get('content-length') ||
                         (response.body ? new Blob([response.body]).size : 0);

    await env.DB.prepare(`
      INSERT INTO request_logs (
        path, method, duration, status_code, user_agent, ip, referer, country, error,
        user_id, session_id, request_size, response_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      analytics.path,
      analytics.method,
      duration,
      response.status,
      analytics.userAgent,
      analytics.ip,
      analytics.referer,
      analytics.country,
      response.ok ? null : response.statusText,
      analytics.userId || null,
      analytics.sessionId || null,
      analytics.requestSize || 0,
      responseSize
    ).run();
  } catch (error) {
    console.error('Error logging request:', error);
  }
};

export const loggingMiddleware = async (request, env, next) => {
  const startTime = Date.now();
  const url = new URL(request.url);

  try {
    await initLogsTable(env.DB);

    const requestData = {
      path: url.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: getClientIP(request),
      referer: request.headers.get('referer') || '',
      country: request.headers.get('cf-ipcountry') || 'unknown',
      requestSize: parseInt(request.headers.get('content-length') || '0'),
      sessionId: extractSessionId(request),
      userId: null
    };

    request.analytics = requestData;
    request.timing = { startTime };

    const response = await next();

    const duration = Date.now() - startTime;
    const responseSize = response.headers.get('content-length') || 0;

    env.DB.prepare(`
      INSERT INTO request_logs (
        path, method, duration, status_code, user_agent, ip, referer, country, error,
        user_id, session_id, request_size, response_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      requestData.path,
      requestData.method,
      duration,
      response.status,
      requestData.userAgent,
      requestData.ip,
      requestData.referer,
      requestData.country,
      response.ok ? null : response.statusText,
      requestData.userId,
      requestData.sessionId,
      requestData.requestSize,
      responseSize
    ).run().catch(err => console.error('Failed to log request:', err));

    return response;
  } catch (error) {
    console.error('Logging middleware error:', error);
    return await next();
  }
};

function extractSessionId(request) {
  const cookies = request.headers.get('Cookie') || '';
  const sessionCookie = cookies.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='));

  return sessionCookie ? sessionCookie.split('=')[1] : null;
}
