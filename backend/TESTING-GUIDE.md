# OCaaS Backend Test Guide (VPS Production)

Testing base URL: `http://108.160.137.70:3000`

## 1. Health Check
Verify if the server is alive.
```bash
curl http://108.160.137.70:3000/health
```

## 2. Signup
Create a test account.
```bash
curl -X POST http://108.160.137.70:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Alton Test"}'
```

## 3. Login
Login to get your Access Token.
```bash
curl -X POST http://108.160.137.70:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```
*Note: The response will contain an `accessToken`. Save it for the next steps.*

## 4. List Agents (Protected Route)
Verify auth middleware is working. Replace `YOUR_TOKEN` with the one from Step 3.
```bash
curl http://108.160.137.70:3000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Create Agent (Protected Route)
```bash
curl -X POST http://108.160.137.70:3000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Assistant", "modelPreset": "gemini-flash"}'
```
