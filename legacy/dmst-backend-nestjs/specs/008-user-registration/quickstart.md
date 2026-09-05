# Quickstart: User Registration for User Site

## 1. Prerequisites

- Node.js and npm installed
- PostgreSQL and Redis running
- Mail configuration set in environment variables
- Dependencies installed with `npm install`

## 2. Prepare backend

1. Ensure environment values are set (`DB_*`, `JWT_*`, `MAIL_*`, activation/rate-limit variables).
2. Run migrations:

```bash
npm run migration:run
```

3. Start API:

```bash
npm run start:dev
```

## 3. Validate registration flow via API

### 3.1 Register a user

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"new.user@example.com",
    "password":"StrongP@ss1",
    "confirmPassword":"StrongP@ss1",
    "firstName":"New",
    "lastName":"User"
  }'
```

Expected:
- HTTP `201`
- Response includes `code=REGISTER_SUCCESS_PENDING_ACTIVATION`
- `data.user.isActive` is `false`
- Activation email job is queued

### 3.2 Activate account

```bash
curl -X POST http://localhost:3000/api/v1/auth/activate \
  -H 'Content-Type: application/json' \
  -d '{"token":"<activation-token-from-email-link>"}'
```

Expected:
- HTTP `200`
- Response includes `code=ACCOUNT_ACTIVATED_SUCCESS`
- Account moves to active state

### 3.3 Resend activation

```bash
curl -X POST http://localhost:3000/api/v1/auth/resend-activation \
  -H 'Content-Type: application/json' \
  -d '{"email":"new.user@example.com"}'
```

Expected:
- HTTP `200`
- Response includes `code=ACTIVATION_EMAIL_RESENT`
- New activation email is sent if account is pending activation
- Rate limit applies on repeated calls

## 4. Failure and retry scenarios

- Duplicate email registration -> HTTP `409` with readable `message`
- Activation with invalid/expired token -> HTTP `400` with retry guidance
- Excessive register/resend requests -> HTTP `429` with retry-later message

## 5. Frontend integration checklist (user site)

- Build registration page with fields: email, password, confirm password, first name, last name.
- Call `/api/v1/auth/register`, then show check-email confirmation state.
- Implement activation landing flow to submit token to `/api/v1/auth/activate`.
- Provide resend action wired to `/api/v1/auth/resend-activation`.
- Display backend `message` consistently for error/success feedback.
