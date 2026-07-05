# 12 - Roadmap

## Phase 0 - Local skeleton

Goal: Frontend -> n8n -> MySQL works locally.

Status: **Complete.**

## Phase 1 - Brand profile management

Goal: Customer can save and update brand profile data.

Status: **Complete.**

## Phase 2 - Post draft management

Goal: Customer can create, view, and edit post drafts.

Status: **Complete.**

## Phase 3 - AI content generation

Goal: Generate post ideas and captions through stable n8n AI-compatible contracts.

Completed:

- Content planner AI mode
- Generate content ideas workflow
- Generate caption workflow
- Rewrite caption workflow
- Frontend controls for idea/caption/rewrite
- Stable webhook contracts
- AI Code nodes wired to 9router (OpenAI-compatible endpoint)
- Disconnected stub fallback nodes kept inside n8n

Status: **Complete. 9router integration is live and working.**

## Phase 4 - Scheduling simulation

Goal: User can set scheduled_at and status becomes scheduled.

Completed:

- Schedule date field
- Scheduled status
- Scheduled posts list
- Dedicated schedule-post workflow
- Workflow log entries
- Schedule simulation flow

Status: **Complete. Real social publishing is still pending (Phase 5).**

## Phase 4.5 - Approval workflow

Goal: Posts can move through review before scheduling or publishing.

Completed:

- Approve action for needs_review posts
- Reject/cancel actions
- Approval UI
- n8n workflow logging for approval decisions
- Explicit status transition validation

Status: **Complete.**

## Phase 5 - Real social posting

Goal: Scheduled posts can be sent to an external posting service.

Possible tools:

- Buffer
- Ayrshare
- Publer
- Direct platform APIs

Status: **Not started.**

## Phase 6 - Authentication and SaaS structure

Goal: Multiple users and customers can use the app safely.

Tasks:

- Add auth
- Add workspaces
- Add workspace members
- Add access rules

Status: **Not started.**

## Phase 7 - Billing

Goal: Paid subscription controls usage limits.

Tasks:

- Add subscription table
- Add usage limits
- Add payment provider
- Add billing page

Status: **Not started.**

## Completed milestones

- Phase 0 local skeleton
- Phase 1 brand profile management
- Phase 2 post draft management
- Phase 3 AI content generation via 9router
- Phase 4 scheduling simulation
- Phase 4.5 approval workflow
- Dashboard summary and polish
- Validation and error handling
- Data consistency cleanup
- Workflow logs
- Laptop migration guide

## Next recommended milestone

Phase 5 - Real social posting.

## Future milestones

- Calendar view
- Social accounts management
- Real social posting
- Analytics and reporting
- Authentication and workspaces
- Billing
