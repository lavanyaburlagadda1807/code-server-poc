# IDE Client Integration

This document describes the IDE Client functionality that has been integrated into the code-server project.

## Overview

The IDE Client is a web-based interface that manages IDE sessions through APIs, providing functionality for:

- Session management (create, stop, restart)
- Real-time status polling
- Token-based authentication
- Inactivity timeout handling
- Session URL sharing
- Mobile device detection

## Access

The IDE Client can be accessed at: `http://localhost:8080/ide-client`

## Features

### Authentication & Token Management

- Automatic token refresh on 401 responses
- Token storage in localStorage (secure httpOnly cookies recommended for production)
- PostMessage communication with parent window for token passing

### Session Management

- Create new IDE sessions
- Stop existing sessions (with confirmation dialog)
- Force start when another session exists
- Automatic restart for unhealthy sessions

### Real-time Status Updates

- 10-second polling intervals for session status
- Automatic state transitions based on session status
- Loading states for better user experience

### Inactivity Handling

- 30-minute inactivity timeout
- Activity detection (mouse, keyboard, touch events)
- Automatic session stop on inactivity

### Session Sharing

- Copy session URL to clipboard
- Open session in new tab
- Share collaborative sessions

### Device Support

- Desktop-optimized interface
- Mobile detection with appropriate messaging
- Responsive design for different screen sizes

## API Endpoints

The IDE Client integrates with the following API endpoints:

### 1. WebSocket Details & Session Creation

- **Endpoint**: `/api/nkb_virtual_labs/user/ccbp_ide/session/v1/`
- **Purpose**: Create or get existing IDE session

### 2. Session Status

- **Endpoint**: `/api/nkb_virtual_labs/user/ccbp_ide/session_status/v1/`
- **Purpose**: Get current session status

### 3. Stop Session

- **Endpoint**: `/api/nkb_virtual_labs/user/ccbp_ide/stop_session/v1/`
- **Purpose**: Stop an active IDE session

### 4. Refresh Token

- **Endpoint**: `/api/nkb_auth_v2/refresh_auth_tokens/v1/`
- **Purpose**: Refresh authentication tokens

## Environment Configuration

The client supports two environments:

- **Beta**: `https://nkb-backend-ccbp-beta.earlywave.in`
- **Production**: `https://nkb-backend-ccbp-prod-apis.ccbp.in/api`

Default environment is set to `beta`.

## Session States

| State                     | Description                   | User Action        |
| ------------------------- | ----------------------------- | ------------------ |
| **CREATING**              | Session is being created      | Loading spinner    |
| **INITIALIZING_DROP**     | Drop environment initializing | Loading spinner    |
| **READY**                 | IDE ready for use             | Full IDE interface |
| **STOPPING**              | Session stopping              | Status card        |
| **STOPPED**               | Session stopped               | Restart button     |
| **UNHEALTHY**             | Session unhealthy             | Auto-restart       |
| **ACTIVE_SESSION_EXISTS** | Another session active        | Force start option |

## Error Handling

### Authentication Errors (401)

- Automatic token refresh attempt
- Fallback to no_auth state if refresh fails

### Active Session Exists (400)

- Display force start option
- Allow user to stop existing session and start new one

### Network Errors

- Display error message with retry option
- Graceful degradation for offline scenarios

## Usage Flow

1. **Loading**: Initial application load
2. **Device Detection**: Check if mobile/desktop
3. **Parent Communication**: Wait for session data from parent window
4. **Session Initialization**: Create or get existing session
5. **Status Polling**: Monitor session status until ready
6. **Ready State**: Display IDE interface with controls
7. **Inactivity Monitoring**: Track user activity and handle timeout

## Development

### Starting the Server

```bash
npm start
```

This will start the development server with hot reloading.

### Accessing IDE Client

Navigate to `http://localhost:8080/ide-client` in your browser.

### Integration with Parent Application

The IDE Client expects to be loaded in an iframe and receive session data via postMessage:

```javascript
// Parent window sends:
window.frames["ide-client"].postMessage(
  {
    session_id: "your-session-id",
    access_token: "your-access-token",
    refresh_token: "your-refresh-token",
    // ... other session data
  },
  "*",
)
```

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- CSP headers configured for secure resource loading
- PostMessage origin validation recommended
- HTTPS required for production deployment

## Browser Support

- Modern browsers with ES6+ support
- PostMessage API support
- localStorage support
- Fetch API support

## Mobile Support

Mobile devices show a message directing users to open on desktop, as the IDE experience is optimized for desktop environments.

## Customization

The interface uses Inter font and a blue color scheme matching the design requirements. All styling is contained within the single HTML file for easy deployment and modification.
