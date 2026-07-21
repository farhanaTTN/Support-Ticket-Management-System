# API Contract

Base URL: `/api`  
Auth header: `Authorization: Bearer <token>` (required except where noted)  
Error shape: `{ "error": string, "details"?: unknown }`

---

## Endpoint: Health Check

**Method:** `GET`  
**Path:** `/api/health`  
**Purpose:** Verify API is running  
**Auth:** Public

### Response

```json
{ "status": "ok" }
```

---

## Endpoint: Login

**Method:** `POST`  
**Path:** `/api/auth/login`  
**Purpose:** Exchange credentials for a JWT  
**Auth:** Public

### Request

```json
{
  "email": "bob.agent@example.com",
  "password": "Password123!"
}
```

### Response `200`

```json
{
  "token": "<jwt>",
  "user": {
    "id": "string",
    "name": "Bob Agent",
    "email": "bob.agent@example.com",
    "role": "AGENT"
  }
}
```

### Validation Rules

- `email`: valid email, trimmed
- `password`: non-empty string

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Invalid email format or missing password |
| 401 | Invalid email or password (generic message) |

---

## Endpoint: Current User

**Method:** `GET`  
**Path:** `/api/auth/me`  
**Purpose:** Return the authenticated user's profile  
**Auth:** Authenticated

### Response `200`

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "AGENT"
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 401 | Missing, invalid, or expired token |

---

## Endpoint: List Users

**Method:** `GET`  
**Path:** `/api/users`  
**Purpose:** List seeded users (for assignee dropdown)  
**Auth:** Authenticated

### Response `200`

```json
[
  { "id": "string", "name": "string", "email": "string", "role": "AGENT" }
]
```

---

## Endpoint: Create Ticket

**Method:** `POST`  
**Path:** `/api/tickets`  
**Purpose:** Create a new ticket (status defaults to OPEN)  
**Auth:** Authenticated

### Request

```json
{
  "title": "Printer not working",
  "description": "Cannot print from floor 2",
  "priority": "HIGH",
  "assignedToId": "user-id-or-null"
}
```

### Response `201`

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "HIGH",
  "status": "OPEN",
  "assignedToId": "string|null",
  "createdById": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "createdBy": { "id": "...", "name": "...", "email": "...", "role": "..." },
  "assignedTo": { "id": "...", "name": "...", "email": "...", "role": "..." } | null
}
```

### Validation Rules

- `title`: non-empty, max 200 chars
- `description`: non-empty, max 5000 chars
- `priority`: `LOW | MEDIUM | HIGH | CRITICAL`
- `assignedToId`: optional; must reference existing user if provided
- `createdById`: derived from token `sub` (not accepted in body)

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Validation failure or invalid assignee |
| 401 | Not authenticated |

---

## Endpoint: List Tickets

**Method:** `GET`  
**Path:** `/api/tickets?q=&status=`  
**Purpose:** List tickets with optional keyword search and status filter  
**Auth:** Authenticated

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Keyword search in title and description |
| `status` | enum | Filter by ticket status |

### Response `200`

```json
[ { /* Ticket object */ } ]
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Invalid status filter value |
| 401 | Not authenticated |

---

## Endpoint: Get Ticket

**Method:** `GET`  
**Path:** `/api/tickets/:id`  
**Purpose:** Ticket detail with comments and allowed next statuses  
**Auth:** Authenticated

### Response `200`

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "MEDIUM",
  "status": "OPEN",
  "assignedToId": null,
  "createdById": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "createdBy": { /* User */ },
  "assignedTo": null,
  "comments": [
    {
      "id": "string",
      "ticketId": "string",
      "message": "string",
      "createdAt": "ISO-8601",
      "createdBy": { /* User */ }
    }
  ],
  "allowedNextStatuses": ["IN_PROGRESS", "CANCELLED"]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |
| 404 | Ticket not found |

---

## Endpoint: Update Ticket

**Method:** `PATCH`  
**Path:** `/api/tickets/:id`  
**Purpose:** Update title, description, priority, or assignee  
**Auth:** AGENT or ADMIN

### Request

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "LOW",
  "assignedToId": "user-id-or-null"
}
```

All fields optional; at least one should be provided.

### Response `200`

Ticket object (without comments).

### Validation Rules

- Same field rules as create
- `status` is **not** accepted — use the status endpoint

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Validation failure or invalid assignee |
| 401 | Not authenticated |
| 403 | REQUESTER role |
| 404 | Ticket not found |

---

## Endpoint: Change Status

**Method:** `POST`  
**Path:** `/api/tickets/:id/status`  
**Purpose:** Transition ticket status via state machine  
**Auth:** AGENT or ADMIN

### Request

```json
{ "status": "IN_PROGRESS" }
```

### Response `200`

Updated ticket object.

### Validation Rules

- `status` must be a valid enum value
- Transition must be allowed by state machine
- Self-transition (same status) rejected

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| 400 | Invalid transition | `Cannot transition from OPEN to CLOSED` |
| 400 | Already in status | `Ticket is already OPEN` |
| 401 | Not authenticated | |
| 403 | REQUESTER role | |
| 404 | Ticket not found | |

---

## Endpoint: Delete Ticket

**Method:** `DELETE`  
**Path:** `/api/tickets/:id`  
**Purpose:** Permanently delete a ticket and its comments  
**Auth:** AGENT or ADMIN

### Response `204`

No body.

### Error Responses

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |
| 403 | REQUESTER role |
| 404 | Ticket not found |

---

## Endpoint: Add Comment

**Method:** `POST`  
**Path:** `/api/tickets/:id/comments`  
**Purpose:** Add a comment to a ticket  
**Auth:** Authenticated

### Request

```json
{ "message": "Investigating the issue now." }
```

### Response `201`

```json
{
  "id": "string",
  "ticketId": "string",
  "message": "string",
  "createdAt": "ISO-8601",
  "createdBy": { /* User */ }
}
```

### Validation Rules

- `message`: non-empty, max 5000 chars
- Author derived from token `sub`

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Empty or too-long message |
| 401 | Not authenticated |
| 404 | Ticket not found |
