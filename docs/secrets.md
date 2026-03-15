# GitHub Secrets Convention (Saralam CI/CD)

Store these in **GitHub → Repository → Settings → Secrets and variables → Actions**. The pipeline resolves environment from the branch (`develop` → develop, `qa` → qa, `main` → prod) and overlays the matching secrets onto the committed `.env.<environment>` file to produce `.env` at build/runtime.

## Naming pattern

Secrets are named by environment prefix so the workflow can choose the right set per branch:

| Secret name | Used for |
| ----------- | -------- |
| `DEVELOP_SECRET_KEY` | Backend JWT secret (develop) |
| `QA_SECRET_KEY` | Backend JWT secret (qa) |
| `PROD_SECRET_KEY` | Backend JWT secret (prod) |
| `DEVELOP_DB_SERVER` | DB host (develop) |
| `QA_DB_SERVER` | DB host (qa) |
| `PROD_DB_SERVER` | DB host (prod) |
| `DEVELOP_DB_USER` | DB user (develop) |
| `DEVELOP_DB_PASSWORD` | DB password (develop) |
| `QA_DB_USER` / `QA_DB_PASSWORD` | DB creds (qa) |
| `PROD_DB_USER` / `PROD_DB_PASSWORD` | DB creds (prod) |
| `DEVELOP_RAZORPAY_KEY_ID` | Razorpay test key (develop) |
| `DEVELOP_RAZORPAY_KEY_SECRET` | Razorpay test secret (develop) |
| `QA_RAZORPAY_KEY_ID` / `QA_RAZORPAY_KEY_SECRET` | Razorpay (qa) |
| `PROD_RAZORPAY_KEY_ID` / `PROD_RAZORPAY_KEY_SECRET` | Razorpay live (prod) |
| `GOOGLE_CLIENT_ID` | Shared across all envs (backend only needs this to verify Google ID tokens) |
| `DEVELOP_SMTP_USER` / `DEVELOP_SMTP_PASSWORD` | SMTP (develop) |
| `QA_SMTP_USER` / `QA_SMTP_PASSWORD` | SMTP (qa) |
| `PROD_SMTP_USER` / `PROD_SMTP_PASSWORD` | SMTP (prod) |

## Local .env flow

**Backend**

```bash
cd backend
cp .env.develop .env   # or .env.qa / .env.prod
# Optionally override secrets in .env (never commit .env)
```

**Frontend (webapp or admin)**

```bash
cd saralam_webapp   # or saralam_admin
cp .env.develop .env
# Vite reads .env at build time; override secrets locally if needed
```

The `.env.develop`, `.env.qa`, and `.env.prod` files are committed with non-secret values and placeholders. The generated `.env` is gitignored.
