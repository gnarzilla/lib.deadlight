// deadlight-core/src/logging/analytics.js
// Log analytics and insights

import { Database } from '../db/database.js';

export class LogAnalytics {
  constructor(db) {
    this.db = db instanceof Database ? db : new Database(db);
  }

  /**
   * Get traffic summary for timeframe
   * @param {string} timeframe - Time period (1h, 24h, 7d, 30d)
   * @returns {Promise<object>} Traffic summary
   */
  async getTrafficSummary(timeframe = '24h') {
    const timeMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = timeMap[timeframe] || '24 hours';

    const summary = await this.db.first(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT ip) as unique_visitors,
        AVG(duration) as avg_response_time,
        SUM(request_size + response_size) as total_bandwidth,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        COUNT(CASE WHEN status_code >= 500 THEN 1 END) as server_errors
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${interval}')
    `);

    return {
      timeframe,
      totalRequests: summary?.total_requests || 0,
      uniqueVisitors: summary?.unique_visitors || 0,
      avgResponseTime: Math.round(summary?.avg_response_time || 0),
      totalBandwidth: summary?.total_bandwidth || 0,
      errorRate: summary?.total_requests ? 
        (summary.error_count / summary.total_requests * 100).toFixed(2) : 0,
      serverErrors: summary?.server_errors || 0
    };
  }

  /**
   * Get top pages by traffic
   * @param {string} timeframe - Time period
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Top pages
   */
  async getTopPages(timeframe = '24h', limit = 10) {
    const timeMap = {
      '1h': '1 hour',
      '24h': '24 hours', 
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = timeMap[timeframe] || '24 hours';

    return await this.db.all(`
      SELECT 
        path,
        COUNT(*) as hits,
        COUNT(DISTINCT ip) as unique_visitors,
        AVG(duration) as avg_duration
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${interval}')
      GROUP BY path
      ORDER BY hits DESC
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get error analysis
   * @param {string} timeframe - Time period
   * @returns {Promise<object>} Error analysis
   */
  async getErrorAnalysis(timeframe = '24h') {
    const timeMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days', 
      '30d': '30 days'
    };

    const interval = timeMap[timeframe] || '24 hours';

    const errors = await this.db.all(`
      SELECT 
        status_code,
        path,
        COUNT(*) as count,
        error
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${interval}')
        AND status_code >= 400
      GROUP BY status_code, path, error
      ORDER BY count DESC
      LIMIT 20
    `);

    const summary = await this.db.first(`
      SELECT 
        COUNT(CASE WHEN status_code = 404 THEN 1 END) as not_found,
        COUNT(CASE WHEN status_code >= 500 THEN 1 END) as server_errors,
        COUNT(CASE WHEN status_code = 403 THEN 1 END) as forbidden
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${interval}')
        AND status_code >= 400
    `);

    return {
      timeframe,
      errors,
      summary: {
        notFound: summary?.not_found || 0,
        serverErrors: summary?.server_errors || 0,
        forbidden: summary?.forbidden || 0
      }
    };
  }

  /**
   * Get geographic distribution
   * @param {string} timeframe - Time period
   * @returns {Promise<Array>} Geographic data
   */
  async getGeographicData(timeframe = '24h') {
    const timeMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = timeMap[timeframe] || '24 hours';

    return await this.db.all(`
      SELECT 
        country,
        COUNT(*) as requests,
        COUNT(DISTINCT ip) as unique_visitors
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${interval}')
        AND country != 'unknown'
      GROUP BY country
      ORDER BY requests DESC
      LIMIT 20
    `);
  }

  /**
   * Get hourly traffic pattern
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Array>} Hourly traffic data
   */
  async getHourlyPattern(days = 7) {
    return await this.db.all(`
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as requests,
        AVG(duration) as avg_duration
      FROM request_logs 
      WHERE timestamp >= datetime('now', '-${days} days')
      GROUP BY hour
      ORDER BY hour
    `);
  }
}
