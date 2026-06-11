#ifndef LIB_DEADLIGHT_CONNECTION_POOL_H
#define LIB_DEADLIGHT_CONNECTION_POOL_H

#include <glib.h>
#include <gio/gio.h>

typedef enum {
    CONN_TYPE_PLAIN,
    CONN_TYPE_CLIENT_TLS,
    CONN_TYPE_SERVER_TLS
} ConnectionType;

typedef struct _ConnectionPool ConnectionPool;

ConnectionPool *connection_pool_new(gint max_per_host, gint idle_timeout,
                                    gint max_total_idle, const gchar *eviction_policy,
                                    gint health_check_interval, gboolean reuse_ssl);
void            connection_pool_free(ConnectionPool *pool);
GIOStream      *connection_pool_get(ConnectionPool *pool, const gchar *host,
                                    guint16 port, ConnectionType type);
void            connection_pool_release(ConnectionPool *pool, GIOStream *stream,
                                        const gchar *host, guint16 port, ConnectionType type);
gboolean        connection_pool_register(ConnectionPool *pool, GIOStream *stream,
                                          const gchar *host, guint16 port, ConnectionType type);
gboolean        connection_pool_upgrade_to_tls(ConnectionPool *pool, GIOStream *plain_stream,
                                                GIOStream *tls_stream, const gchar *host, guint16 port);
void            connection_pool_get_stats(ConnectionPool *pool, guint *idle_count,
                                          guint *active_count, guint64 *total_gets,
                                          guint64 *cache_hits, gdouble *hit_rate,
                                          guint64 *evicted, guint64 *failed);
void            connection_pool_discard(ConnectionPool *pool, GIOStream *stream);

#endif
