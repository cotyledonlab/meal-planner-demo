# Traefik Configuration Directory

This directory contains Traefik-related files for SSL certificate management and logging.

## Structure

- `letsencrypt/` - Let's Encrypt certificate storage
  - `acme.json` - Certificate data (auto-generated, excluded from git)
- `logs/` - Traefik access logs
  - `access.log` - HTTP access logs (excluded from git)

## Security Note

The `letsencrypt/` directory will contain sensitive SSL certificates and keys. These files are automatically excluded from version control via `.gitignore`.

## First Run

On first deployment, Traefik will automatically:

1. Create `acme.json` with proper permissions (600)
2. Request SSL certificates from Let's Encrypt
3. Store certificates in `acme.json`

Certificate renewal happens automatically before expiration.
