# GameGen2 Data Directory

This directory contains the data files used by GameGen2.

## Files

- `users.json`: Stores user account information
  - Email addresses (as user IDs)
  - Password hashes and salts
  - Account creation timestamps
  - Last login timestamps

- `sessions.json`: Stores active user sessions
  - Session IDs as keys
  - Associated user IDs
  - Session creation timestamps
  - Last activity timestamps

## Data Format

### users.json
```json
{
  "user@example.com": {
    "password_hash": "hashed_password_string",
    "salt": "unique_salt_for_user",
    "created_at": 1616943600,
    "last_login": 1616943600
  }
}
```

### sessions.json
```json
{
  "session_id_token": {
    "user_id": "user@example.com",
    "created_at": 1616943600,
    "last_seen": 1616943600
  }
}
```

## Note

These files are automatically created and managed by the authentication system. They should not be manually edited while the application is running to avoid data corruption or security issues.