# Kenchain Groups: full-stack deployment bundle

This bundle keeps the uploaded frontend and adds a Django API backed by PostgreSQL. The backend is designed to match the exact API paths and JSON fields already used by this frontend.

## What's included

- Existing static website in `frontend/` (`index.html`, `css/`, `js/`, `config.js`).
- Django backend in `backend/`.
- PostgreSQL-compatible models for accommodations, tours, stay requests, trip requests, enquiries, parcels and parcel events.
- Django admin screens for managing listings, booking statuses, enquiries and parcel updates.
- A `seed_demo` command for starter accommodation/tour records and a sample parcel (`KC1234567890`).
- Frontend API URL support through `config.js` and `window.KENCHAIN_CONFIG.API_BASE`.

The included listings and parcel are sample records. Booking requests are persisted in the database with `Pending` status. This does not process payments, confirm room availability, or connect to a real courier carrier.

## Local run

Open a terminal in `backend/` and run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver 8000
```

Then, in a second terminal, go to the `frontend/` directory and run:

```bash
python3 -m http.server 5500
```

Open `http://localhost:5500`. For local frontend-to-backend requests, set `CORS_ALLOWED_ORIGINS=http://localhost:5500` in the backend environment. The default backend API is `http://127.0.0.1:8000`; edit `frontend/config.js` to:

```js
window.KENCHAIN_CONFIG = { API_BASE: 'http://127.0.0.1:8000' };
```

The backend health check is `http://127.0.0.1:8000/api/health/` and the Django admin is `http://127.0.0.1:8000/admin/`.

## Render deployment

Deploy the database first, then the backend, then the static frontend.

### 1. PostgreSQL

In Render, choose **New + → PostgreSQL**. Name it `kenchain-db`, choose a region close to your users, and select a persistent plan appropriate for production. After creation, copy its **Internal Database URL** for the backend's `DATABASE_URL` environment variable.

### 2. Django backend web service

Create a **Web Service** from this GitHub repository:

- Root Directory: `backend`
- Runtime: `Python 3`
- Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start Command: `python manage.py migrate && python manage.py seed_demo && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- Region: use the same region as PostgreSQL

Set these environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Render PostgreSQL **Internal Database URL** |
| `SECRET_KEY` | A newly generated long random secret |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` and your backend's custom hostname if used |
| `CORS_ALLOWED_ORIGINS` | The full frontend origin, e.g. `https://kenchain-frontend.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | The backend origin, e.g. `https://kenchain-api.onrender.com` |

Once deployed, test `https://YOUR-BACKEND.onrender.com/api/health/`. It should return JSON with `status: ok`.

### 3. Static frontend

Create a **Static Site** from the same repository:

- Root Directory: `frontend`
- Build Command: leave blank
- Publish Directory: `.`

After the backend service is deployed, edit `frontend/config.js` before deploying the frontend:

```js
window.KENCHAIN_CONFIG = {
  API_BASE: 'https://YOUR-BACKEND.onrender.com'
};
```

Replace the placeholder with the actual backend origin. Do not add `/api` to the end. Add the final frontend origin to the backend's `CORS_ALLOWED_ORIGINS`, then redeploy the backend if changed.

## API endpoints implemented

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health/` | Health check |
| GET | `/api/hospitality/properties/` | Active accommodation listings |
| POST | `/api/hospitality/bookings/` | Save a stay request and return an `HSP-...` reference |
| GET | `/api/tours/packages/` | Active tour packages |
| POST | `/api/tours/bookings/` | Save a tour request and return a `TRV-...` reference |
| GET | `/api/bookings/<reference>/` | Look up a stay or tour request |
| POST | `/api/inquiries/` | Save a contact enquiry |
| GET | `/api/track/<tracking_number>/` | Look up parcel tracking events |

## Admin operations

Create the first admin account from the Render service shell:

```bash
python manage.py createsuperuser
```

Visit `https://YOUR-BACKEND.onrender.com/admin/` to add/edit accommodations and packages, update booking statuses, view enquiries and manage parcel tracking events.

## Notes before production

- Configure a real email notification provider if booking/enquiry emails are required. Email delivery is not included in this bundle.
- Add payment gateway integration separately if online payments are required.
- Booking status starts as `Pending`; staff must review and update it in Django admin.
- The seeded parcel is demonstration data only. Create real parcel records and tracking events in Django admin for operational use.
- Back up the PostgreSQL database and restrict admin access to trusted staff.
