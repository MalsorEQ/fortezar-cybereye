# Rule Catalog

| ID | Severity | Check |
|---|---|---|
| CE001 | High | Final page is HTTP |
| CE002 | Medium | HSTS missing |
| CE003 | Medium | CSP missing |
| CE004 | Medium | CSP contains unsafe directives |
| CE005 | Low | X-Content-Type-Options missing/weak |
| CE006 | Low | Referrer-Policy missing |
| CE007 | Low | Permissions-Policy missing |
| CE008 | Medium | CORS wildcard |
| CE009 | Low | Technology disclosure headers |
| CE010 | Medium | Cookie missing Secure on HTTPS |
| CE011 | Low | Cookie missing HttpOnly |
| CE012 | Low | Cookie missing SameSite |
| CE013 | Info | security.txt missing |
| CE014 | High | Form action posts to HTTP |
| CE015 | Medium | Potential mixed-content reference |

Severity is a project judgment and does not by itself establish exploitability.

---

## Detailed Rule References

### CE001: Final page is HTTP
* **Why it matters:** Traffic transmitted over HTTP is unencrypted, allowing attackers to intercept, modify, or steal sensitive data via man-in-the-middle (MitM) attacks.
* **Authoritative Reference:** [OWASP Transport Layer Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
* **Limitations:** Local development environments (e.g., `localhost`) will trigger this rule legitimately.

### CE002: HSTS missing
* **Why it matters:** HTTP Strict Transport Security (HSTS) prevents downgrade attacks by forcing browsers to connect only via HTTPS.
* **Authoritative Reference:** [RFC 6797 - HTTP Strict Transport Security (HSTS)](https://datatracker.ietf.org/doc/html/rfc6797)
* **Limitations:** Implementing HSTS without testing can lock out users if HTTPS configuration fails.

### CE003: CSP missing
* **Why it matters:** Content Security Policy (CSP) restricts the sources from which content can be loaded, significantly mitigating Cross-Site Scripting (XSS) and data injection attacks.
* **Authoritative Reference:** [MDN Web Docs: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
* **Limitations:** Adding a strict CSP to legacy applications may break inline scripts or styles.

### CE004: CSP contains unsafe directives
* **Why it matters:** Directives like `unsafe-inline` or `unsafe-eval` bypass the primary protections of a CSP, leaving the application vulnerable to XSS.
* **Authoritative Reference:** [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
* **Limitations:** Some modern frontend frameworks may still implicitly require unsafe directives during development.

### CE005: X-Content-Type-Options missing/weak
* **Why it matters:** The `nosniff` directive prevents browsers from MIME-sniffing a response away from the declared content-type, preventing malicious file execution (e.g., executing a disguised image as JavaScript).
* **Authoritative Reference:** [MDN Web Docs: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
* **Limitations:** Requires accurate `Content-Type` headers from the server; otherwise, legitimate files may fail to load.

### CE006: Referrer-Policy missing
* **Why it matters:** Without a Referrer-Policy, sensitive information (such as session IDs or password reset tokens in URLs) can be leaked to external sites via the `Referer` header.
* **Authoritative Reference:** [W3C Referrer Policy](https://w3c.github.io/webappsec-referrer-policy/)
* **Limitations:** Highly restrictive policies may break legitimate analytics or third-party integrations relying on referrer data.

### CE007: Permissions-Policy missing
* **Why it matters:** Permissions-Policy (formerly Feature-Policy) allows developers to explicitly disable access to powerful browser features like the camera, microphone, or geolocation, reducing the attack surface.
* **Authoritative Reference:** [W3C Permissions Policy](https://w3c.github.io/webappsec-permissions-policy/)
* **Limitations:** False positives can occur if the application heavily relies on hardware features without declaring a policy.

### CE008: CORS wildcard
* **Why it matters:** An `Access-Control-Allow-Origin: *` header allows any website to read responses from the server, potentially exposing sensitive authenticated data to unauthorized domains.
* **Authoritative Reference:** [MDN Web Docs: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
* **Limitations:** Wildcards are safe and required for public, unauthenticated APIs (like public CDNs).

### CE009: Technology disclosure headers
* **Why it matters:** Headers like `X-Powered-By` or `Server` expose backend technology versions, aiding attackers in targeting specific known vulnerabilities (CVEs).
* **Authoritative Reference:** [OWASP Information Gathering](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server)
* **Limitations:** Removing these headers requires server-level configuration which might not be accessible in all hosting environments.

### CE010: Cookie missing Secure on HTTPS
* **Why it matters:** The `Secure` flag ensures cookies are only transmitted over encrypted connections. Without it, MitM attackers can capture cookies sent over accidental HTTP requests.
* **Authoritative Reference:** [MDN Web Docs: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
* **Limitations:** Setting the `Secure` flag on `localhost` without HTTPS will prevent the cookie from being set entirely.

### CE011: Cookie missing HttpOnly
* **Why it matters:** The `HttpOnly` flag prevents client-side scripts from accessing the cookie, severely mitigating the impact of XSS attacks.
* **Authoritative Reference:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#httponly-attribute)
* **Limitations:** Not applicable for cookies that are explicitly designed to be read by client-side JavaScript (e.g., CSRF tokens).

### CE012: Cookie missing SameSite
* **Why it matters:** The `SameSite` attribute controls whether cookies are sent with cross-site requests, providing robust defense against Cross-Site Request Forgery (CSRF) attacks.
* **Authoritative Reference:** [IETF RFC 6265bis - SameSite Cookies](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis)
* **Limitations:** Setting `SameSite=Strict` can break legitimate cross-origin navigation flows (like SSO logins).

### CE013: security.txt missing
* **Why it matters:** A `security.txt` file provides a standardized way for security researchers to contact the organization and responsibly report vulnerabilities.
* **Authoritative Reference:** [RFC 9116 - A File Format to Aid in Security Vulnerability Disclosure](https://datatracker.ietf.org/doc/html/rfc9116)
* **Limitations:** Often omitted intentionally on small personal projects or internal services.

### CE014: Form action posts to HTTP
* **Why it matters:** Submitting form data (especially credentials or PII) to an HTTP endpoint transmits the data in plaintext, exposing it to interception.
* **Authoritative Reference:** [OWASP Top 10: Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
* **Limitations:** None in production; all form submissions should strictly use HTTPS.

### CE015: Potential mixed-content reference
* **Why it matters:** Loading HTTP resources (scripts, images) on an HTTPS page degrades the security of the entire page and can allow MitM attackers to inject malicious content.
* **Authoritative Reference:** [MDN Web Docs: Mixed Content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
* **Limitations:** Identifying mixed content statically can lead to false positives if the resources are conditionally loaded or if protocol-relative URLs (`//`) are misidentified.
