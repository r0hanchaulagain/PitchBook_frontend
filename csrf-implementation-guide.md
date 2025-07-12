# CSRF Protection Implementation Guide

## Overview
This document outlines how to implement CSRF protection in your frontend application to work with our secure backend. The system uses the `csrf-csrf` package with double submit cookie pattern for enhanced security.

## Table of Contents
1. [How CSRF Protection Works](#how-csrf-protection-works)
2. [Getting Started](#getting-started)
3. [Implementation Steps](#implementation-steps)
4. [Example Implementation](#example-implementation)
5. [Error Handling](#error-handling)
6. [Testing CSRF Protection](#testing-csrf-protection)
7. [Troubleshooting](#troubleshooting)

## How CSRF Protection Works

Our CSRF protection uses the Double Submit Cookie pattern:
1. The server generates a CSRF token and sets it in an HTTP-only cookie
2. The frontend must include this token in a header for non-GET requests
3. The server verifies the token in the header matches the one in the cookie

## Getting Started

### Prerequisites
- Ensure your frontend is running on the domain specified in `FRONTEND_URL`
- Make sure cookies are enabled in the browser
- Use a library that supports credentials (cookies) in cross-origin requests

### Required Headers
For all authenticated requests, include these headers:
```http
Content-Type: application/json
x-csrf-token: <token-from-cookie>
```

## Implementation Steps

### 1. Fetch CSRF Token
Before making any POST/PUT/DELETE requests, fetch a CSRF token:

```javascript
async function fetchCsrfToken() {
  const response = await fetch('http://your-api-url/csrf-token', {
    method: 'GET',
    credentials: 'include'  // Important for cookies
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token');
  }
  
  const data = await response.json();
  return data.token; // The token to use in subsequent requests
}
```

### 2. Make Authenticated Requests
For all state-changing requests (POST, PUT, DELETE, PATCH), include the CSRF token:

```javascript
async function makeAuthenticatedRequest(url, method = 'POST', body = null) {
  // Get CSRF token first
  const csrfToken = await fetchCsrfToken();
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken
    },
    credentials: 'include',  // Important for cookies
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  // Handle 403 Forbidden (CSRF token invalid/expired)
  if (response.status === 403) {
    // Optionally refresh the token and retry
    const newToken = await fetchCsrfToken();
    options.headers['x-csrf-token'] = newToken;
    return fetch(url, options);
  }
  
  return response;
}
```

### 3. Handle Form Submissions
For HTML forms, include the CSRF token in a hidden field:

```html
<form id="login-form">
  <input type="hidden" name="_csrf" id="csrf-token" value="">
  <!-- other form fields -->
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get CSRF token
  const response = await fetch('/csrf-token', { credentials: 'include' });
  const { token } = await response.json();
  
  // Set token in form
  document.getElementById('csrf-token').value = token;
  
  // Submit form with token
  const formData = new FormData(e.target);
  const result = await makeAuthenticatedRequest('/api/endpoint', 'POST', Object.fromEntries(formData));
  
  // Handle response
});
</script>
```

## Example Implementation

### React Example
```jsx
import { useEffect, useState } from 'react';

function App() {
  const [csrfToken, setCsrfToken] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('http://your-api-url/csrf-token', {
          credentials: 'include'
        });
        const { token } = await response.json();
        setCsrfToken(token);
      } catch (err) {
        setError('Failed to fetch CSRF token');
      }
    };
    
    fetchToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://your-api-url/protected-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ /* your data */ })
      });
      
      if (!response.ok) throw new Error('Request failed');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  };

  // Render your component
}
```

## Error Handling

### Common Errors
1. **403 Forbidden**: CSRF token invalid or expired
   - Solution: Fetch a new token and retry the request

2. **CORS Errors**: Make sure:
   - `credentials: 'include'` is set in fetch options
   - The frontend URL is in the allowed origins
   - The server is configured to send the correct CORS headers

3. **Cookie Not Set**: Ensure:
   - The API domain is correct
   - The path is set to '/'
   - The `secure` flag matches the protocol (http/https)

## Testing CSRF Protection

1. **Verify Token Generation**
   - Make a GET request to `/csrf-token`
   - Check that a cookie named `psifi.x-csrf-token` is set
   - Verify the response contains a token

2. **Test Protected Endpoints**
   - Make a POST request without the CSRF token (should fail with 403)
   - Make a POST request with an invalid token (should fail with 403)
   - Make a POST request with a valid token (should succeed)

## Troubleshooting

### Token Mismatch
If you're getting token mismatch errors:
1. Verify the token in the header matches the one in the cookie
2. Check that the token is not being modified in transit
3. Ensure the token is being sent in the correct format

### CORS Issues
If you're seeing CORS errors:
1. Verify the frontend URL is in the allowed origins
2. Check that `credentials: 'include'` is set in fetch options
3. Ensure the server is sending the correct CORS headers

### Cookie Not Being Set
If the CSRF cookie is not being set:
1. Check the cookie domain and path
2. Verify the `secure` flag matches the protocol (http/https)
3. Ensure the response includes the `Set-Cookie` header

## Best Practices

1. Always fetch a new CSRF token when:
   - The user logs in
   - The page loads
   - A token validation fails

2. Store the token in memory, not in localStorage or sessionStorage

3. Include error handling for token expiration

4. For Single Page Applications (SPAs), consider using an interceptor to automatically handle CSRF tokens

## Security Considerations

- Never expose the CSRF token in server logs
- Use HTTPS in production
- Keep the CSRF secret secure and never expose it to the client
- Set appropriate cookie attributes (HttpOnly, Secure, SameSite)

## Support

For any issues or questions, please contact the backend development team.
