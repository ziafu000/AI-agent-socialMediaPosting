# 19 - Authentication Implementation Guide (Clerk)

## Overview

This guide walks through implementing authentication using **Clerk** (free tier: 10,000 MAU).

**Cost:** $0 for first 10,000 users

## Phase 1: Clerk Setup (30 minutes)

### Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up (free account)
3. Create new application: "AI Social SaaS"
4. Select authentication methods:
   - ✅ Email + Password
   - ✅ Google OAuth (recommended)
   - ✅ GitHub OAuth (optional)

### Step 2: Get API Keys

From Clerk Dashboard:
- Copy **Publishable Key** (starts with `pk_test_`)
- Copy **Secret Key** (starts with `sk_test_`)

### Step 3: Install Clerk Package

```bash
cd apps/web
npm install @clerk/nextjs
```

## Phase 2: Frontend Integration (2 hours)

### Step 1: Add Environment Variables

**apps/web/.env.local:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Clerk URLs (for redirects)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 2: Wrap App with ClerkProvider

**apps/web/src/app/layout.tsx:**
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 3: Create Auth Pages

**apps/web/src/app/sign-in/[[...sign-in]]/page.tsx:**
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

**apps/web/src/app/sign-up/[[...sign-up]]/page.tsx:**
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### Step 4: Add Middleware for Protection

**apps/web/src/middleware.ts:**
```typescript
import { authMiddleware } from '@clerk/nextjs';

// Protect all routes except public ones
export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Step 5: Update n8n-client to Include User ID

**apps/web/src/lib/n8n-client.ts:**
```typescript
import { auth } from '@clerk/nextjs';

async function postToN8n<TResponse>(
  webhookUrl: string | undefined,
  payload: unknown,
  errorMessage: string,
) {
  if (!webhookUrl) {
    throw new Error("Missing n8n webhook URL");
  }

  // Get authenticated user ID
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized - please sign in");
  }

  // Add user_id to all requests
  const payloadWithAuth = {
    ...payload,
    user_id: userId,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadWithAuth),
  });

  // ... rest of error handling
}
```

### Step 6: Add User Profile Button

**apps/web/src/components/header.tsx:**
```typescript
import { UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">AI Social SaaS</h1>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
```

Add `<Header />` to all protected pages.

## Phase 3: Database Migration (1 hour)

### Step 1: Add user_id Column to Tables

**SQL Migration:**
```sql
-- Add user_id to customers table
ALTER TABLE customers 
ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'migration_placeholder';

-- Add user_id to brand_profiles table
ALTER TABLE brand_profiles 
ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'migration_placeholder';

-- Add user_id to posts table
ALTER TABLE posts 
ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'migration_placeholder';

-- Add indexes for performance
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Remove default after migration
ALTER TABLE customers ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE brand_profiles ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE posts ALTER COLUMN user_id DROP DEFAULT;
```

**Run Migration:**
```bash
# Local development
docker exec ai_social_mysql mysql -uroot -p<password> ai_social_saas < migration_add_user_id.sql

# Production (Railway)
mysql -h <railway-host> -u root -p ai_social_saas < migration_add_user_id.sql
```

### Step 2: Create API Keys Table

```sql
CREATE TABLE api_keys (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  INDEX idx_api_key (api_key),
  INDEX idx_user_id (user_id)
);
```

## Phase 4: n8n Workflow Updates (3-4 hours)

### Step 1: Update All Workflows to Validate user_id

**Add to EVERY webhook workflow:**

**Node 1: Webhook Trigger**
- Keep existing settings

**Node 2: Validate User ID (Code Node)**
```javascript
// Extract user_id from request body
const userId = $input.all()[0].json.body.user_id;

// Validate user_id exists
if (!userId || typeof userId !== 'string' || userId.trim() === '') {
  return {
    success: false,
    message: 'Unauthorized',
    error: 'Missing or invalid user_id',
    statusCode: 401
  };
}

// Pass through with validated user_id
return {
  user_id: userId.trim(),
  ...($input.all()[0].json.body)
};
```

**Node 3: IF Node - Check Validation**
- **Condition:** `{{ $json.success === false }}`
- **True → Respond Error**
- **False → Continue to existing logic**

### Step 2: Update All SELECT Queries

**Before (NO tenant isolation):**
```sql
SELECT * FROM customers;
```

**After (WITH tenant isolation):**
```sql
SELECT * FROM customers 
WHERE user_id = '{{ $json.user_id }}';
```

**Apply to ALL workflows:**
- List Customers
- List Brand Profiles  
- List Posts
- Get Customer Detail
- List Scheduled Posts
- Dashboard Summary

### Step 3: Update All INSERT Queries

**Before:**
```sql
INSERT INTO customers (name, email, company_name, industry)
VALUES ('{{ $json.name }}', '{{ $json.email }}', '{{ $json.company_name }}', '{{ $json.industry }}');
```

**After:**
```sql
INSERT INTO customers (user_id, name, email, company_name, industry)
VALUES ('{{ $json.user_id }}', '{{ $json.name }}', '{{ $json.email }}', '{{ $json.company_name }}', '{{ $json.industry }}');
```

### Step 4: Update All UPDATE/DELETE Queries

**Before:**
```sql
UPDATE posts 
SET status = 'scheduled', scheduled_at = '{{ $json.scheduled_at }}'
WHERE id = {{ $json.id }};
```

**After (ensure user owns the record):**
```sql
UPDATE posts 
SET status = 'scheduled', scheduled_at = '{{ $json.scheduled_at }}'
WHERE id = {{ $json.id }} AND user_id = '{{ $json.user_id }}';
```

### Step 5: Test Each Workflow

```bash
# Test with valid user_id
curl -X POST http://localhost:5678/webhook/list-customers \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_2xxx"}'

# Test without user_id (should fail)
curl -X POST http://localhost:5678/webhook/list-customers \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Phase 5: Testing (1 hour)

### Test Checklist

**Authentication Flow:**
- [ ] Can sign up with email
- [ ] Can sign in with email
- [ ] Can sign in with Google OAuth
- [ ] Can sign out
- [ ] Redirected to /sign-in when accessing protected routes
- [ ] Redirected to /dashboard after sign-in

**Data Isolation:**
- [ ] User A cannot see User B's customers
- [ ] User A cannot see User B's brand profiles
- [ ] User A cannot see User B's posts
- [ ] User A cannot update User B's records
- [ ] User A cannot delete User B's records

**API Security:**
- [ ] Requests without user_id return 401
- [ ] Requests with invalid user_id return 401
- [ ] All workflows validate user_id

## Phase 6: Migrate Existing Data (if needed)

If you have existing local data with customers, you need to assign them to test user accounts:

```sql
-- Get your test user ID from Clerk dashboard
-- Format: user_2xxxxxxxxxxxxx

-- Assign all existing data to one test user
UPDATE customers SET user_id = 'user_2xxxxxxxxxxxxx' WHERE user_id = 'migration_placeholder';
UPDATE brand_profiles SET user_id = 'user_2xxxxxxxxxxxxx' WHERE user_id = 'migration_placeholder';
UPDATE posts SET user_id = 'user_2xxxxxxxxxxxxx' WHERE user_id = 'migration_placeholder';
```

## Troubleshooting

### Issue: "Invalid publishable key"
**Solution:** Check `.env.local` has correct `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Issue: Infinite redirect loop
**Solution:** Check middleware `publicRoutes` includes `/sign-in` and `/sign-up`

### Issue: "user_id is required" error
**Solution:** 
1. Check `auth()` is called before API requests
2. Check user is signed in
3. Check webhook receives `user_id` in payload

### Issue: Database constraint error
**Solution:** Run migration to add `user_id` columns first

## Success Criteria

- ✅ All routes protected except sign-in/sign-up
- ✅ User can sign up and sign in
- ✅ All API calls include user_id
- ✅ All database queries filter by user_id
- ✅ Zero cross-tenant data leaks
- ✅ User profile button works

## Next Steps

After authentication is working:
1. Deploy to production (see [21-DEPLOYMENT-GUIDE.md](21-DEPLOYMENT-GUIDE.md))
2. Add caching (see [18-PRODUCTION-READINESS-ROADMAP.md](18-PRODUCTION-READINESS-ROADMAP.md) Phase 5C)
3. Add monitoring (see Phase 5D)
