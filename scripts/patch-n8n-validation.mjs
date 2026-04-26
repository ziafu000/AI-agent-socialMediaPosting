import fs from "node:fs";

const inputPath = process.argv[2] ?? "workflows-validation-source.json";
const outputPath = process.argv[3] ?? "workflows-validation-patched.json";

const workflows = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const workflowPatchers = {
  "Create Customer": patchCreateCustomer,
  "Save Brand Profile": patchSaveBrandProfile,
  "Create Post": patchCreatePost,
  "Update Brand Profile": patchUpdateBrandProfile,
  "Update Post": patchUpdatePost,
  "Get Customer Detail": patchGetCustomerDetail,
};

for (const workflow of workflows) {
  const patcher = workflowPatchers[workflow.name];

  if (patcher) {
    patcher(workflow);
  }
}

fs.writeFileSync(outputPath, JSON.stringify(workflows, null, 2));

function patchCreateCustomer(workflow) {
  addValidationGate(
    workflow,
    "create-customer",
    `const body = $json.body ?? {};
const errors = [];

function escapeSql(value) {
  return String(value ?? "").trim().replace(/'/g, "''");
}

function requireText(field, label) {
  const value = String(body[field] ?? "").trim();
  if (!value) errors.push(label + " is required");
  return escapeSql(value);
}

const name = requireText("name", "Name");
const emailRaw = requireText("email", "Email").toLowerCase();
const email = escapeSql(emailRaw);
const companyName = escapeSql(body.company_name);
const industry = escapeSql(body.industry);

if (emailRaw && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailRaw)) {
  errors.push("Email format is invalid");
}

if (errors.length > 0) {
  return [{ json: { valid: false, response: { success: false, message: "Validation failed", error: errors.join("; ") } } }];
}

return [{ json: { valid: true, body: { name, email, company_name: companyName, industry } } }];`,
  );

  setQuery(
    workflow,
    "MySQL",
    `INSERT INTO customers (name, email, company_name, industry)
VALUES (
  '{{ $json.body.name }}',
  '{{ $json.body.email }}',
  '{{ $json.body.company_name }}',
  '{{ $json.body.industry }}'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  company_name = VALUES(company_name),
  industry = VALUES(industry);`,
  );

  replaceWebhookBodyRefs(workflow);
}

function patchSaveBrandProfile(workflow) {
  addValidationGate(
    workflow,
    "save-brand-profile",
    `const body = $json.body ?? {};
const errors = [];

function escapeSql(value) {
  return String(value ?? "").trim().replace(/'/g, "''");
}

function positiveInteger(field, label) {
  const value = Number(body[field]);
  if (!Number.isInteger(value) || value < 1) errors.push(label + " must be a positive number");
  return value;
}

function requireText(field, label) {
  const value = String(body[field] ?? "").trim();
  if (!value) errors.push(label + " is required");
  return escapeSql(value);
}

const customerId = positiveInteger("customer_id", "Customer ID");
const brandName = requireText("brand_name", "Brand name");

if (errors.length > 0) {
  return [{ json: { valid: false, response: { success: false, message: "Validation failed", error: errors.join("; ") } } }];
}

return [{
  json: {
    valid: true,
    body: {
      customer_id: customerId,
      brand_name: brandName,
      target_audience: escapeSql(body.target_audience),
      brand_voice: escapeSql(body.brand_voice),
      products_services: escapeSql(body.products_services),
      default_cta: escapeSql(body.default_cta),
      words_to_use: escapeSql(body.words_to_use),
      words_to_avoid: escapeSql(body.words_to_avoid)
    }
  }
}];`,
  );

  replaceWebhookBodyRefs(workflow);
}

function patchCreatePost(workflow) {
  addValidationGate(workflow, "create-post", postValidationCode(false));
  replaceWebhookBodyRefs(workflow);
}

function patchUpdateBrandProfile(workflow) {
  addValidationGate(
    workflow,
    "update-brand-profile",
    `const body = $json.body ?? {};
const errors = [];

function escapeSql(value) {
  return String(value ?? "").trim().replace(/'/g, "''");
}

function positiveInteger(field, label) {
  const value = Number(body[field]);
  if (!Number.isInteger(value) || value < 1) errors.push(label + " must be a positive number");
  return value;
}

function requireText(field, label) {
  const value = String(body[field] ?? "").trim();
  if (!value) errors.push(label + " is required");
  return escapeSql(value);
}

const id = positiveInteger("id", "Brand profile ID");
const customerId = positiveInteger("customer_id", "Customer ID");
const brandName = requireText("brand_name", "Brand name");

if (errors.length > 0) {
  return [{ json: { valid: false, response: { success: false, message: "Validation failed", error: errors.join("; ") } } }];
}

return [{
  json: {
    valid: true,
    body: {
      id,
      customer_id: customerId,
      brand_name: brandName,
      target_audience: escapeSql(body.target_audience),
      brand_voice: escapeSql(body.brand_voice),
      products_services: escapeSql(body.products_services),
      default_cta: escapeSql(body.default_cta),
      words_to_use: escapeSql(body.words_to_use),
      words_to_avoid: escapeSql(body.words_to_avoid)
    }
  }
}];`,
  );

  replaceWebhookBodyRefs(workflow);
}

function patchUpdatePost(workflow) {
  addValidationGate(workflow, "update-post", postValidationCode(true));
  replaceWebhookBodyRefs(workflow);
}

function patchGetCustomerDetail(workflow) {
  addValidationGate(
    workflow,
    "get-customer-detail",
    `const body = $json.body ?? {};
const errors = [];
const customerId = Number(body.customer_id);

if (!Number.isInteger(customerId) || customerId < 1) {
  errors.push("Customer ID must be a positive number");
}

if (errors.length > 0) {
  return [{ json: { valid: false, response: { success: false, message: "Validation failed", error: errors.join("; ") } } }];
}

return [{ json: { valid: true, body: { customer_id: customerId } } }];`,
  );

  for (const node of workflow.nodes) {
    const query = node.parameters?.query;
    if (typeof query === "string") {
      node.parameters.query = query
        .replaceAll("$('Webhook').item.json.body.customer_id", "$('Validate Input').item.json.body.customer_id")
        .replaceAll('$("Webhook").item.json.body.customer_id', '$("Validate Input").item.json.body.customer_id');
    }
  }
}

function postValidationCode(requireId) {
  return `const body = $json.body ?? {};
const errors = [];
const allowedPlatforms = ["facebook", "instagram", "linkedin", "tiktok"];
const allowedStatuses = ["draft", "needs_review", "approved", "scheduled", "publishing", "published", "failed", "cancelled"];

function escapeSql(value) {
  return String(value ?? "").trim().replace(/'/g, "''");
}

function positiveInteger(field, label) {
  const value = Number(body[field]);
  if (!Number.isInteger(value) || value < 1) errors.push(label + " must be a positive number");
  return value;
}

function requireText(field, label) {
  const value = String(body[field] ?? "").trim();
  if (!value) errors.push(label + " is required");
  return escapeSql(value);
}

function allowedValue(field, label, allowed) {
  const value = String(body[field] ?? "").trim().toLowerCase();
  if (!allowed.includes(value)) errors.push(label + " is invalid");
  return value;
}

${requireId ? 'const id = positiveInteger("id", "Post ID");' : ""}
const customerId = positiveInteger("customer_id", "Customer ID");
const platform = allowedValue("platform", "Platform", allowedPlatforms);
const status = allowedValue("status", "Status", allowedStatuses);
const topic = requireText("topic", "Topic");
let scheduledAt = String(body.scheduled_at ?? "").trim().replace("T", " ");

if (status === "scheduled" && !scheduledAt) {
  errors.push("Scheduled at is required when status is scheduled");
}

if (scheduledAt && Number.isNaN(Date.parse(scheduledAt))) {
  errors.push("Scheduled at is invalid");
}

scheduledAt = escapeSql(scheduledAt);

if (errors.length > 0) {
  return [{ json: { valid: false, response: { success: false, message: "Validation failed", error: errors.join("; ") } } }];
}

return [{
  json: {
    valid: true,
    body: {
      ${requireId ? "id," : ""}
      customer_id: customerId,
      platform,
      topic,
      caption: escapeSql(body.caption),
      hashtags: escapeSql(body.hashtags),
      status,
      scheduled_at: scheduledAt
    }
  }
}];`;
}

function addValidationGate(workflow, suffix, jsCode) {
  workflow.nodes = workflow.nodes.filter(
    (node) =>
      !["Validate Input", "Is Valid", "Respond Validation Error"].includes(
        node.name,
      ),
  );

  for (const node of workflow.nodes) {
    if (node.name !== "Webhook") {
      node.position = [node.position[0] + 440, node.position[1]];
    }
  }

  const webhook = getNode(workflow, "Webhook");
  const firstTarget = workflow.connections.Webhook?.main?.[0]?.[0]?.node;

  const validateNode = {
    parameters: { jsCode },
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [220, 0],
    id: `validate-${suffix}`,
    name: "Validate Input",
  };

  const ifNode = {
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 2,
        },
        conditions: [
          {
            id: `valid-${suffix}`,
            leftValue: "={{ $json.valid }}",
            rightValue: true,
            operator: {
              type: "boolean",
              operation: "true",
              singleValue: true,
            },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
    type: "n8n-nodes-base.if",
    typeVersion: 2.2,
    position: [440, 0],
    id: `if-${suffix}`,
    name: "Is Valid",
  };

  const errorNode = {
    parameters: {
      respondWith: "json",
      responseBody: "={{ $json.response }}",
      options: { responseCode: 400 },
    },
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.2,
    position: [660, 220],
    id: `respond-validation-error-${suffix}`,
    name: "Respond Validation Error",
  };

  workflow.nodes.push(validateNode, ifNode, errorNode);

  workflow.connections.Webhook = {
    main: [[{ node: "Validate Input", type: "main", index: 0 }]],
  };
  workflow.connections["Validate Input"] = {
    main: [[{ node: "Is Valid", type: "main", index: 0 }]],
  };
  workflow.connections["Is Valid"] = {
    main: [
      firstTarget ? [{ node: firstTarget, type: "main", index: 0 }] : [],
      [{ node: "Respond Validation Error", type: "main", index: 0 }],
    ],
  };

  webhook.position = [0, 0];
}

function replaceWebhookBodyRefs(workflow) {
  for (const node of workflow.nodes) {
    const query = node.parameters?.query;
    if (typeof query === "string") {
      node.parameters.query = query
        .replaceAll('$("#Webhook").item.json.body', '$("Validate Input").item.json.body')
        .replaceAll('$("Webhook").item.json.body', '$("Validate Input").item.json.body')
        .replaceAll("$('Webhook').item.json.body", "$('Validate Input').item.json.body");
    }
  }
}

function setQuery(workflow, nodeName, query) {
  getNode(workflow, nodeName).parameters.query = query;
}

function getNode(workflow, name) {
  const node = workflow.nodes.find((item) => item.name === name);

  if (!node) {
    throw new Error(`Missing node ${name} in workflow ${workflow.name}`);
  }

  return node;
}
