# n8n Workflows

This folder keeps the exported local workflow state in Git.

Files:

- `local-active-workflows.json`: current exported workflows from local n8n
- `local-active-workflows.validation.json`: current validated export kept in sync with the running local n8n instance

Current sync flow:

1. Export current workflows from local n8n into `local-active-workflows.json`
2. Keep `local-active-workflows.validation.json` aligned with the active local export
3. Import updated workflow JSON in n8n when needed
4. Run `npm run n8n:workflows:reactivate`

Legacy helper:

- `npm run n8n:workflows:patch-validation`

This helper still exists, but the repository now treats the active local n8n
export and production-style `/webhook/...` URLs as the default operating state.

Important:

- n8n workflow import deactivates workflows
- after import, all workflows must be reactivated and n8n must be restarted
- historical dirty rows in MySQL are not auto-deleted by this patch
