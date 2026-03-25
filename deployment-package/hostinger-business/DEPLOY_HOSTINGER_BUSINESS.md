# Hostinger Business Quick Deploy

1. Upload the full hostinger-business folder to your Hostinger app directory.
2. Copy .env.production.example to .env and set real production values.
3. Run: bash start-production.sh
4. Set startup command in Hostinger to: npx pm2 restart ecosystem.config.cjs --env production --update-env
5. Verify health endpoint: /health
