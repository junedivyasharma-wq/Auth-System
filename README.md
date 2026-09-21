# Auth System API

An Express and MongoDB authentication API with email OTP verification, JWT access tokens, refresh-token sessions, and logout support.

## Features

- User registration with SHA-256 password hashing
- OTP email verification through Gmail OAuth2
- Login with short-lived JWT access tokens
- HTTP-only refresh-token cookies
- Refresh-token rotation
- Single-session and all-session logout
- Authenticated user lookup with `getMe`

## Requirements

- Node.js 18 or newer
- MongoDB
- A Gmail account configured for OAuth2 mail delivery

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/auth_sys
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REFRESH_TOKEN=your-google-oauth-refresh-token
GOOGLE_USER=your-gmail-address@example.com
```

Start the development server:

```bash
npm run dev
```

The API is available at `http://localhost:3000`.

## API Endpoints

All authentication routes use the `/api/auth` prefix.

### Register

`POST /api/auth/register`

```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "your-password"
}
```

Creates an unverified user and sends an OTP to the supplied email address.

### Verify email

`GET /api/auth/verify-email`

Request body:

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

### Login

`POST /api/auth/login`

```json
{
  "username": "jane_doe",
  "password": "your-password"
}
```

Returns an access token and sets the `refreshtoken` HTTP-only cookie. The access token expires after 10 minutes; the refresh token expires after 7 days.

### Get current user

`GET /api/auth/getMe`

Send the access token using the standard authorization header:

```text
Authorization: Bearer <access-token>
```

### Refresh access token

`GET /api/auth/refresh-token`

Uses the `refreshtoken` cookie, rotates it, and returns a new access token.

### Logout

`GET /api/auth/logout`

Revokes the current refresh-token session and clears the cookie.

### Logout all sessions

`GET /api/auth/logout-all`

Revokes all refresh-token sessions belonging to the current user.

## Project Structure

```text
src/
├── app.js                 # Express app and middleware
├── index.js               # Database connection and server startup
├── config/                # Environment and MongoDB configuration
├── controllers/           # Authentication handlers
├── models/                # User, OTP, and session schemas
├── routes/                # API route definitions
├── services/              # Email delivery
└── utils/                 # OTP and email template helpers
```

## Notes

- Keep `.env` out of version control.
- Cookies are configured as `secure`, so local HTTP testing may require HTTPS or a development-specific cookie configuration.
- There are currently no automated tests configured; `npm test` is a placeholder.