# JWT Authentication & Cryptographic Security Architecture

**System**: BuildAsset Logistics Enterprise Platform  
**Specification**: RFC 7519 JSON Web Token (JWT) & Stateless Spring Security

---

## 1. Security Overview

BuildAsset Logistics implements a **stateless, token-based authentication architecture** leveraging JSON Web Tokens (JWT) signed via HMAC-SHA256 (HS256). No HTTP sessions are stored in memory or databases on the servers, ensuring high performance, horizontal scalability, and multi-service decoupling.

---

## 2. Authentication Lifecycle Diagram

```
+----------------+                +-----------------+                 +----------------+
| React Frontend |                |   API Gateway   |                 |  Auth Service  |
|  (Port 5173)   |                |   (Port 8080)   |                 |  (Port 8085)   |
+-------+--------+                +--------+--------+                 +-------+--------+
        |                                  |                                  |
        | 1. POST /api/auth/register       |                                  |
        +--------------------------------->| Forward to lb://AUTH-SERVICE     |
        |                                  +--------------------------------->|
        |                                  |                                  | 2. BCrypt Hash Password
        |                                  |                                  | 3. Save to auth_schema.users
        |                                  |                                  | 4. Generate & return JWT
        |                                  |<---------------------------------+
        |<---------------------------------+ 201 Created (Token + User Data)  |
        |                                  |                                  |
        | 5. POST /api/auth/login          |                                  |
        +--------------------------------->| Forward to lb://AUTH-SERVICE     |
        |                                  +--------------------------------->|
        |                                  |                                  | 6. BCrypt Verify Credentials
        |                                  |                                  | 7. Issue Signed JWT
        |                                  |<---------------------------------+
        |<---------------------------------+ 200 OK (JWT Token)               |
        |                                  |                                  |
        | 8. GET /api/equipment (Protected)|                                  |
        |    Header: Bearer <JWT>          |                                  |
        +--------------------------------->| 9. Validate Signature & Expiry   |
        |                                  | 10. Extract Claims               |
        |                                  | 11. Forward to EQUIPMENT-SERVICE |
        |                                  +--------------------------------->|
```

---

## 3. Core Cryptographic Components

### A. Password Hashing (BCrypt)
- Plaintext passwords are never stored in the database or logged in application traces.
- `BCryptPasswordEncoder` is utilized with standard work factor (10 salt rounds):
  ```java
  String hashedPassword = passwordEncoder.encode(rawPassword);
  boolean matches = passwordEncoder.matches(inputPassword, storedHash);
  ```

### B. JWT Structure & Claims
Each JWT issued by `AUTH-SERVICE` consists of standard three base64url-encoded parts:
1. **Header**:
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```
2. **Payload (Claims)**:
   ```json
   {
     "sub": "contractor_admin",
     "role": "ROLE_CONTRACTOR",
     "userId": 104,
     "iat": 1726650000,
     "exp": 1726736400
   }
   ```
3. **Signature**:
   `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secretKey)`

### C. Secret Key Management
- The HMAC key is configured via the environment variable `JWT_SECRET`.
- A 256-bit cryptographically secure key fallback is maintained for local development:
  `BuildAssetLogisticsSuperSecretKeyForJWTAuthentication2026Enterprise`
- Keys are loaded into standard `javax.crypto.SecretKey` via `Keys.hmacShaKeyFor()`.

---

## 4. API Gateway Token Validation Filter

The Spring Cloud API Gateway (`:8080`) executes a custom global filter `JwtAuthenticationFilter` with high precedence (`order = -100`):

1. **Whitelisted Public Endpoints** (Bypass validation):
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/validate`
   - `/v3/api-docs/**`
   - `/swagger-ui/**`
   - `OPTIONS` pre-flight requests
2. **Protected Business Routes**:
   - Checks presence of `Authorization: Bearer <token>` header.
   - Parses cryptographic signature and ensures token is not expired (`exp.after(now)`).
   - Decorates downstream request headers with `X-Auth-Username` and `X-Auth-Role`.
   - On missing or invalid token, rejects with HTTP `401 UNAUTHORIZED`.

---

## 5. Frontend Axios Interceptor Integration

The React client automatically injects the token and handles session expiry:
```javascript
// Request: Automatically attach Bearer token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("buildasset_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: On 401 Unauthorized, redirect to /signin
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("buildasset_token");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);
```
