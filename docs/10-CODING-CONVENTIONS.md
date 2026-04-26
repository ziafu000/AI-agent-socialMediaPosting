# 10 — Coding Conventions

## Language

Use TypeScript for frontend code.

## Style

Prioritize readability.

Use clear names.

Bad:

```ts
const x = async () => {}
```

Good:

```ts
async function createCustomer() {}
```

## React component rules

Use functional components.

Use simple local state for the first page.

Do not add state management libraries yet.

Avoid:

- Redux
- Zustand
- Jotai
- TanStack Query

Add them only when the app really needs them.

## File naming

Use lowercase with hyphen for reusable files:

```text
customer-form.tsx
api-client.ts
```

Next.js route files follow Next.js convention:

```text
page.tsx
layout.tsx
loading.tsx
error.tsx
```

## Environment variables

Use environment variables from:

```text
process.env.NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL
```

Do not hardcode webhook URLs directly in components if avoidable.

## API client convention

Later create:

```text
apps/web/src/lib/n8n-client.ts
```

Example future function:

```ts
export async function createCustomer(payload: CreateCustomerPayload) {
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create customer");
  }

  return response.json();
}
```

## Error handling

Every request should handle:

- Network error
- Non-200 response
- Invalid JSON response
- Missing environment variable

## SQL convention

Use snake_case for table and column names.

Examples:

```text
company_name
created_at
updated_at
scheduled_at
```

## Git commit messages

Use simple conventional style:

```text
feat: add customer form
fix: correct n8n webhook URL
chore: add docker compose setup
```
