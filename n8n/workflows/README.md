# n8n Workflows

This folder keeps the exported local workflow state in Git.

Files:

- `local-active-workflows.json`: current exported workflows from local n8n
- `local-active-workflows.validation.json`: patched export with validation/error-handling nodes

Validation patch flow:

1. Export current workflows from local n8n into `local-active-workflows.json`
2. Run `npm run n8n:workflows:patch-validation`
3. Import the patched JSON in n8n
4. Run `npm run n8n:workflows:reactivate`

Important:

- n8n workflow import deactivates workflows
- after import, all workflows must be reactivated and n8n must be restarted
