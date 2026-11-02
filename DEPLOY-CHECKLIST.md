# Render deployment checklist

- [ ] Push this project root to a GitHub repository.
- [ ] Create a persistent Render PostgreSQL database.
- [ ] Create the Render Python web service with root directory `backend`.
- [ ] Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
- [ ] Confirm `/api/health/` returns `{ "status": "ok", ... }`.
- [ ] Create a Django superuser from the Render Shell.
- [ ] Create the Render Static Site with frontend root with publish directory `.`.
- [ ] Set `API_BASE` in the `frontend/config.js` to the backend origin and redeploy the static site.
- [ ] Verify accommodation and tour listings load.
- [ ] Submit a test stay request and a test tour request.
- [ ] Verify both generated references work in the booking lookup.
- [ ] Verify parcel demo lookup with `KC1234567890`.
- [ ] Remove/replace demo content before accepting real customers.
