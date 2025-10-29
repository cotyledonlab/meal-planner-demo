# NextAuth Configuration for Dokploy Deployment

## Issue

When deploying with a subdirectory path (`/demos/meal-planner`), NextAuth requires specific configuration to handle cookies and URLs correctly.

## Environment Variables Required in Dokploy

Set these environment variables in your Dokploy application settings:

```bash
# The base domain WITHOUT the path
NEXTAUTH_URL=https://cotyledonlab.com

# The subdirectory path (must match next.config.js basePath)
BASE_PATH=/demos/meal-planner

# Generate a secure secret: openssl rand -base64 32
AUTH_SECRET=your-secure-random-secret-here

# Database connection
DATABASE_URL=postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=30&connect_timeout=30

# Optional: Discord OAuth (if using Discord login)
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
```

## Important Notes

1. **NEXTAUTH_URL should NOT include the BASE_PATH**
   - ✅ Correct: `NEXTAUTH_URL=https://cotyledonlab.com`
   - ❌ Wrong: `NEXTAUTH_URL=https://cotyledonlab.com/demos/meal-planner`

   Next.js automatically prepends the basePath to all routes, including auth routes.

2. **Cookie Configuration**
   - Cookies are now explicitly configured with the correct path
   - The cookie path is set to `BASE_PATH` to ensure proper scoping
   - Secure cookies are used in production

3. **After Changing Environment Variables**
   - Redeploy the application in Dokploy
   - Clear browser cookies for the site
   - Test authentication flow

## Troubleshooting

If you still see errors after deployment:

1. **Clear old cookies**: Use browser DevTools > Application > Cookies and delete all cookies for your domain
2. **Check logs**: Look for NextAuth errors in the container logs
3. **Verify variables**: Ensure all environment variables are set correctly in Dokploy
4. **Test locally**: Run with `docker compose up` to test the configuration locally first

## Files Modified

- `apps/web/src/server/auth/config.ts` - Added cookie configuration with basePath support
