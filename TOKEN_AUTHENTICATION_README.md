# Token Authentication for Code-Server

This document explains how to use the new token-based authentication feature in code-server, which is designed specifically for iframe integration scenarios.

## Overview

The token authentication feature allows code-server to be embedded in an iframe and authenticate users using access tokens and refresh tokens sent from the parent window via `postMessage`. This is particularly useful for integrating code-server into larger applications where authentication is managed by the parent application.

## Features

- **🔐 Seamless iframe authentication**: No login forms when properly configured
- **📨 postMessage communication**: Parent window can send tokens securely to the iframe
- **🍪 Cookie-based token storage**: Tokens are stored in cookies for session persistence
- **⏱️ Smart timeout handling**: 10-second timeout with automatic retry mechanisms
- **🔄 Backward compatibility**: Works alongside existing password and "none" auth methods
- **✅ Token validation**: Extensible validation system for future token verification needs

## Setup Instructions

### 1. Configure Code-Server for Token Authentication

Edit your code-server configuration file:

```bash
# Edit the config file
nano ~/.config/code-server/config.yaml
```

Set the authentication method to `token`:

```yaml
bind-addr: 127.0.0.1:8080
auth: token
cert: false
```

### 2. Start Code-Server

```bash
# Development mode
npm run watch

# Or production mode
code-server --auth token
```

### 3. Integration with Parent Application

When code-server is loaded in an iframe with token authentication, it will:

1. **Check for existing tokens** in cookies first
2. **Display a clean loading interface** while waiting for tokens
3. **Listen for postMessage** from the parent window
4. **Automatically authenticate** when valid tokens are received
5. **Redirect to the workspace** on successful authentication
6. **Show minimal error messages** only when authentication fails

## Parent Window Integration

### Basic Implementation

```javascript
// Listen for iframe ready message
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TOKEN_AUTH_READY") {
    // Send tokens immediately when iframe is ready
    sendTokensToIframe()
  }
})

function sendTokensToIframe() {
  const iframe = document.getElementById("code-server-iframe")
  const message = {
    type: "AUTH_TOKENS",
    accessToken: "your-access-token-here",
    refreshToken: "your-refresh-token-here",
  }

  iframe.contentWindow.postMessage(message, "http://your-code-server-domain")
}
```

### Complete Example

See `example-parent.html` for a fully functional integration example that includes:

- **Automatic token sending** when iframe is ready
- **Real-time logging** of communication events
- **Manual token override** for testing
- **Error handling** and retry mechanisms

## Message Protocol

### From Parent to Code-Server

```javascript
{
    type: 'AUTH_TOKENS',
    accessToken: 'string',  // Required: Valid access token
    refreshToken: 'string'  // Required: Valid refresh token
}
```

### From Code-Server to Parent

```javascript
// When ready to receive tokens
{
    type: 'TOKEN_AUTH_READY'
}

// When authentication succeeds
{
    type: 'AUTH_SUCCESS'
}

// When authentication fails
{
    type: 'AUTH_FAILED',
    error: 'Error description'
}
```

## Token Requirements

### Current Implementation

The current implementation accepts any non-empty string tokens for demonstration purposes. For production use, you should:

1. **Implement proper token validation** in `src/node/util.ts`
2. **Add token expiration checks**
3. **Verify token signatures** if using JWTs
4. **Check token permissions** against required scopes

### Future Enhancements

The token validation system is designed to be easily extended:

```typescript
// In src/node/util.ts
export function validateTokensFromCookies(accessToken: string, refreshToken: string): boolean {
  // Add your token validation logic here
  // Examples:
  // - JWT signature verification
  // - Token expiration checks
  // - Permission/scope validation
  // - API calls to auth service

  return isValidToken(accessToken) && isValidToken(refreshToken)
}
```

## User Experience

### Seamless Authentication (Default)

When properly configured:

- **No login prompts** - users go directly to the workspace
- **Minimal loading time** - authentication happens in seconds
- **Automatic retry** - handles temporary network issues
- **Clean interface** - no unnecessary status messages

### Error Handling

Only shows error messages when:

- **Tokens are not provided** within 10 seconds
- **Invalid tokens** are sent from parent
- **Network issues** prevent authentication
- **Server configuration** problems occur

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for token transmission
2. **Token Storage**: Tokens are stored in httpOnly cookies when possible
3. **Origin Validation**: postMessage origin checking prevents XSS attacks
4. **Token Rotation**: Implement proper refresh token rotation
5. **CSP Headers**: Configure Content Security Policy appropriately

## Troubleshooting

### Common Issues

**Problem**: Iframe shows "Authentication timeout"
**Solution**: Ensure parent window is sending tokens via postMessage

**Problem**: Tokens not working in standalone mode
**Solution**: Use iframe mode or set cookies manually for testing

**Problem**: CORS errors in console
**Solution**: Configure proper CORS headers for your domain

### Debug Mode

Enable debug logging by setting log level to debug:

```bash
code-server --auth token --log debug
```

## CLI Usage

```bash
# Set token auth via command line
code-server --auth token

# Set via environment variable
AUTH=token code-server

# Combine with other options
code-server --auth token --host 0.0.0.0 --port 8080
```

## Configuration File

```yaml
# ~/.config/code-server/config.yaml
bind-addr: 0.0.0.0:8080
auth: token
cert: false
# Remove password field when using token auth
```

---

This feature makes code-server perfect for embedding in larger applications where authentication is managed centrally, providing a seamless development environment without the complexity of separate login flows.
