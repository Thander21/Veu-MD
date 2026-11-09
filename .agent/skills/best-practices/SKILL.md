---
name: best-practices
description: Apply modern web development best practices for security, compatibility, and code quality. Use when asked to "apply best practices", "security audit", "modernize code", "code quality review", or "check for vulnerabilities". Do NOT use for accessibility (use web-accessibility), SEO (use seo), performance (use core-web-vitals), or comprehensive multi-area audits (use web-quality-audit).
license: MIT
metadata:
  author: web-quality-skills
  version: '1.0'
---

# Best practices

Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns.

## Security

### HTTPS everywhere

**Enforce HTTPS:**

```html
<!-- ❌ Mixed content -->
<img src="http://example.com/image.jpg" />
<script src="http://cdn.example.com/script.js"></script>

<!-- ✅ HTTPS only -->
<img src="https://example.com/image.jpg" />
<script src="https://cdn.example.com/script.js"></script>

<!-- ✅ Protocol-relative (will use page's protocol) -->
<img src="//example.com/image.jpg" />
```

**HSTS Header:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Content Security Policy (CSP)

```html
<!-- Basic CSP via meta tag -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' https://trusted-cdn.com; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;"
/>

<!-- Better: HTTP header -->
```

**CSP Header (recommended):**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123' https://trusted.com;
  style-src 'self' 'nonce-abc123';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
```

**Using nonces for inline scripts:**

```html
<script nonce="abc123">
  // This inline script is allowed
</script>
```

### Security headers

```
# Prevent clickjacking
X-Frame-Options: DENY

# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Enable XSS filter (legacy browsers)
X-XSS-Protection: 1; mode=block

# Control referrer information
Referrer-Policy: strict-origin-when-cross-origin

# Permissions policy (formerly Feature-Policy)
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### No vulnerable libraries

```bash
# Check for vulnerabilities
npm audit
yarn audit

# Auto-fix when possible
npm audit fix

# Check specific package
npm ls lodash
```

**Keep dependencies updated:**

```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "update": "npm update && npm audit fix"
  }
}
```

**Known vulnerable patterns to avoid:**

```javascript
// ❌ Prototype pollution vulnerable patterns
Object.assign(target, userInput)
_.merge(target, userInput)

// ✅ Safer alternatives
const safeData = JSON.parse(JSON.stringify(userInput))
```

### Input sanitization

```javascript
// ❌ XSS vulnerable
element.innerHTML = userInput
document.write(userInput)

// ✅ Safe text content
element.textContent = userInput

// ✅ If HTML needed, sanitize
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

### Secure cookies

```javascript
// ❌ Insecure cookie
document.cookie = "session=abc123";

// ✅ Secure cookie (server-side)
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Strict; Path=/
```

---

## Tools

| Tool | Purpose |
| ---- | ------- |
| `npm audit` | Dependency vulnerabilities |
| [SecurityHeaders.com](https://securityheaders.com) | Header analysis |
| [Observatory](https://observatory.mozilla.org) | Security scan |

## References

- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
