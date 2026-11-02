# Kenchain Groups frontend: Vercel deployment

This project is a static frontend. It uses React/HTM from `esm.sh` through an import map, so no npm build is required.

## Deploy

1. Extract this ZIP.
2. Push the **contents of the `frontend` folder** to a GitHub repository (so `index.html`, `css/`, `js/`, `config.js`, and `vercel.json` are at the repository root).
3. In Vercel, choose **Add New → Project**, import the repository, and deploy.
4. In Project Settings → Build & Development Settings:
   - Framework Preset: Other
   - Build Command: leave empty / override off
   - Output Directory: `.` (or leave the default if Vercel detects the static site)
   - Install Command: leave empty / override off

## Connect the backend

The ZIP contains only the frontend. Dynamic functions such as listings, booking submissions, booking status, and parcel tracking need the matching API backend.

Before deploying, edit `config.js`:

```js
window.KENCHAIN_CONFIG = {
  API_BASE: 'https://YOUR-BACKEND-DOMAIN'
};
```

Use only the backend origin, without a trailing slash or `/api` suffix unless your backend's routes require that prefix. The frontend's existing API paths are retained.

Configure the backend to:
- allow the exact Vercel domain (including the `https://` origin) in CORS;
- allow credentials if using cookie/session authentication;
- configure CSRF trusted origins and cookie settings if Django session/CSRF authentication is used.

If you attach a custom domain in Vercel, add that origin to the backend configuration too.

## Local preview

From the extracted `frontend` directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.
