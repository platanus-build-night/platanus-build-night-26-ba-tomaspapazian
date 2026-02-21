# Platanus Build Night ft. Anthropic

## 2026 - Buenos Aires - Tiendanube Office

---

This is the code repository for tomaspapazian at Platanus Build Night 26, in Buenos Aires.

* Full name: Tomas Papazian
* Github username: tomaspapazian

Remember you should push the code before the deadline and make sure its deployed.

Good luck 🍌🚀

## Deployment Notes (Vercel + Separate Backend)

Frontend is deployed on Vercel from this repo. Backend should run on a separate host (Render/Railway/Fly/etc).

### Required Vercel environment variable

- `VITE_API_BASE_URL=https://<your-backend-domain>`

Example:
- `VITE_API_BASE_URL=https://pulsescore-api.onrender.com`

### Backend CORS variable (recommended)

Set on backend service:
- `FRONTEND_ORIGINS=https://<your-vercel-domain>,https://<your-custom-domain>`

Example:
- `FRONTEND_ORIGINS=https://platanus-build-night-26-ba-tomaspapazian.vercel.app`

### Common failure

If onboarding shows `Setup failed: Failed to fetch`, the backend URL is usually missing/wrong or blocked by CORS/HTTPS mismatch.
