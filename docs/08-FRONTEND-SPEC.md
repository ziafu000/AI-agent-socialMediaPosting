# 08 - Frontend Specification

This document separates the current local frontend from the target production frontend.

## Current Frontend

**Location:** `apps/web`

**Stack:**
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn-style UI components

**Current request flow:**

```text
Browser -> apps/web/src/lib/n8n-client.ts -> n8n webhook -> MySQL
```

The frontend currently calls n8n webhook URLs directly from the browser through `apps/web/src/lib/n8n-client.ts`.

## Current Routes

Main implemented app routes:
- `/` - dashboard overview
- `/customers` - customer management
- `/brand-profiles` - brand profile management
- `/posts` - post list and post management
- `/post-creator` - AI-assisted post creation
- `/test` - integration/test UI

## Current Capabilities

Implemented local MVP capabilities:
- Customer CRUD through n8n webhooks
- Brand profile management
- Post creation and update
- AI post generation through n8n workflow
- Scheduling/review workflow UI
- Basic dashboard and management screens

## Current Limitations

The frontend is not production-secure yet:
- No authentication provider is wired into the app.
- No protected route middleware exists yet.
- No tenant/user context is enforced in frontend requests.
- Browser code calls n8n webhooks directly.
- `NEXT_PUBLIC_N8N_*` variables expose webhook base URLs to the browser.
- There is no server-side API layer for protected operations yet.

## Target Phase 5A Frontend

Phase 5A should introduce the security boundary required before production deployment.

Target request flow:

```text
Browser -> Next.js server route -> protected n8n webhook -> MySQL
```

Target behavior:
- Add Clerk authentication.
- Add sign-in/sign-up routes.
- Protect application routes with middleware.
- Move protected workflow calls behind Next.js server routes.
- Derive `user_id` from server-side auth, not from client payloads.
- Forward internal auth from Next.js server routes to n8n.
- Stop trusting browser-provided tenant identifiers.

## Target Environment Variables

Current local variables may include browser-visible n8n webhook URLs.

For Phase 5A, split variables by trust boundary:

Browser-safe:
- Clerk publishable key
- Public app URLs if needed

Server-only:
- Clerk secret key
- Internal n8n base URL
- Internal n8n auth secret/API key
- Database/admin credentials if ever needed by server code

Do not expose internal n8n secrets through `NEXT_PUBLIC_*` variables.

## Target API Pattern

Recommended protected pattern:

```text
Client component/page
  -> fetch('/api/...')
  -> Next.js route verifies Clerk session
  -> route attaches trusted user_id and internal auth
  -> n8n validates internal auth
  -> n8n queries by user_id
```

Example endpoint direction:
- Frontend calls `/api/customers` instead of direct n8n customer webhook.
- Frontend calls `/api/posts` instead of direct n8n post webhook.
- Frontend calls `/api/ai/generate-post` instead of direct AI workflow webhook.

## Migration Notes

Do not change frontend payloads to require `user_id` until the database and n8n workflows are updated together.

Safe migration order:
1. Add auth provider and protected routes.
2. Add server API layer while preserving existing local behavior where possible.
3. Add database `user_id` columns and indexes.
4. Update n8n workflows to require trusted `user_id`.
5. Move frontend calls from direct n8n URLs to server routes.
6. Verify one user cannot access another user's data.

## Frontend Verification Checklist

Before considering Phase 5A complete:
- Logged-out users cannot access app pages.
- Logged-in users can complete the existing local MVP flows.
- Browser network tab does not expose internal n8n secrets.
- Protected requests fail without a valid session.
- Requests do not accept client-supplied `user_id` as trusted identity.
- Customer, brand profile, and post data are isolated by authenticated user.
