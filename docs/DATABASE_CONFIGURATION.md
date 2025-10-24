# Database Configuration Guide

## Connection Pool Configuration

The application uses Prisma ORM with PostgreSQL, configured with connection pooling to handle connection termination issues and improve reliability in production environments.

### Connection Pool Parameters

Add these parameters to your `DATABASE_URL` connection string:

```
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=30&connect_timeout=30"
```

#### Parameters Explained:

- **`connection_limit`** (default: 10): Maximum number of database connections in the pool
  - For serverless/edge environments: 5-10
  - For traditional server deployments: 10-20
  - Adjust based on your database server's `max_connections` setting

- **`pool_timeout`** (default: 30 seconds): Maximum time to wait for an available connection from the pool
  - If all connections are in use, queries will wait up to this duration
  - Increase if you have long-running queries
  - Decrease for faster failure in high-concurrency scenarios

- **`connect_timeout`** (default: 30 seconds): Maximum time to wait for initial database connection
  - Helps detect database availability issues quickly
  - Set to 10-30 seconds for production environments

### PostgreSQL Server Configuration

Configure these settings in your PostgreSQL server for optimal performance:

#### Timeout Settings

Add to `postgresql.conf` or set via environment variables:

```conf
# Statement timeout - kills queries running longer than 30 seconds
statement_timeout = 30000  # milliseconds (30 seconds)

# Idle transaction timeout - kills idle transactions after 1 minute
idle_in_transaction_session_timeout = 60000  # milliseconds (60 seconds)

# Connection timeout at server level
tcp_keepalives_idle = 30
tcp_keepalives_interval = 10
tcp_keepalives_count = 3
```

#### Connection Limits

```conf
# Maximum total connections to the database
max_connections = 100

# Reserve some connections for admin tasks
superuser_reserved_connections = 3
```

### Application Configuration

The application includes built-in connection management:

1. **Automatic Reconnection**: Prisma automatically handles connection retries
2. **Graceful Shutdown**: Connections are properly closed on SIGTERM/SIGINT signals
3. **Connection Reuse**: Global singleton pattern prevents connection leaks in development

See `apps/web/src/server/db.ts` for implementation details.

### Monitoring Connection Pool

#### Check Active Connections

Connect to PostgreSQL and run:

```sql
-- View all active connections
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query,
    state_change
FROM pg_stat_activity
WHERE datname = 'meal-planner-demo'
ORDER BY state_change DESC;

-- Count connections by state
SELECT state, COUNT(*)
FROM pg_stat_activity
WHERE datname = 'meal-planner-demo'
GROUP BY state;

-- Check for long-running queries
SELECT
    pid,
    now() - query_start AS duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
  AND datname = 'meal-planner-demo'
ORDER BY duration DESC;
```

#### Connection Pool Exhaustion

If you see errors like "connection pool timeout" or "too many connections":

1. **Increase `connection_limit`**: But stay within database `max_connections`
2. **Optimize Queries**: Reduce query execution time
3. **Scale Database**: Upgrade database instance size
4. **Use Connection Pooler**: Consider PgBouncer for additional pooling layer

### Security Considerations

1. **Never expose PostgreSQL port publicly**
   - Use Docker internal networks
   - Configure firewall rules to block external access

2. **Use SSL/TLS for connections**

   ```
   DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
   ```

3. **Rotate credentials regularly**
   - Use strong, unique passwords
   - Store in environment secrets (not in code)

4. **Monitor for attacks**
   - Review PostgreSQL logs for unauthorized access attempts
   - Set up alerts for failed authentication
   - Watch for SQL injection patterns in application logs

### Troubleshooting

#### Connection Termination Errors

**Error**: `terminating connection due to administrator command`

**Causes**:

- Database server restart
- Statement timeout exceeded
- Idle transaction timeout exceeded
- Manual connection termination

**Solutions**:

1. Add connection pool parameters to DATABASE_URL
2. Configure PostgreSQL timeouts appropriately
3. Optimize long-running queries
4. Ensure transactions are committed/rolled back promptly

#### Pool Timeout Errors

**Error**: `Timed out fetching a new connection from the connection pool`

**Solutions**:

1. Increase `pool_timeout` value
2. Increase `connection_limit` if database allows
3. Optimize query performance
4. Check for connection leaks (unclosed transactions)

#### Connection Refused

**Error**: `Connection refused` or `ECONNREFUSED`

**Solutions**:

1. Verify PostgreSQL is running
2. Check DATABASE_URL is correct
3. Ensure network connectivity (Docker networks, firewall rules)
4. Verify PostgreSQL is listening on the correct port

### Production Best Practices

1. **Connection Pooling**: Always use connection pool parameters
2. **Monitoring**: Set up alerts for connection pool exhaustion
3. **Timeouts**: Configure appropriate statement and idle timeouts
4. **Security**: Never expose database ports publicly
5. **SSL**: Use encrypted connections in production
6. **Backups**: Implement regular automated backups
7. **Logging**: Enable slow query logging for optimization
8. **Scaling**: Plan for horizontal scaling with read replicas if needed

### Testing Connection Configuration

Test your connection configuration:

```bash
# From repository root
pnpm db:push

# Test connection with Prisma Studio
pnpm db:studio

# Run migrations
pnpm db:migrate
```

If successful, your connection configuration is working correctly.

### References

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Prisma Connection URL Parameters](https://www.prisma.io/docs/reference/database-reference/connection-urls)
