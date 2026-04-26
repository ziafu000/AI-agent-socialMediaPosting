import fs from "node:fs";

const inputPath = process.argv[2] ?? "n8n/workflows/local-active-workflows.json";
const outputPath =
  process.argv[3] ?? "n8n/workflows/local-active-workflows.validation.json";

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
  addValidationGate(workflow, "create-customer", createCustomerValidationCode());

  setNodeQuery(
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

  replaceBodyRefs(workflow);
}

function patchSaveBrandProfile(workflow) {
  addValidationGate(
    workflow,
    "save-brand-profile",
    saveBrandProfileValidationCode(),
  );
  replaceBodyRefs(workflow);

  removeNodes(workflow, [
    "Find Existing Brand Profile",
    "Brand Profile Exists",
    "Insert Brand Profile",
  ]);

  const findExistingNode = createMySqlNode({
    id: "find-existing-brand-profile",
    name: "Find Existing Brand Profile",
    position: [660, -140],
    query: `SELECT id
FROM brand_profiles
WHERE customer_id = {{ $('Validate Input').item.json.body.customer_id }}
  AND brand_name = '{{ $('Validate Input').item.json.body.brand_name }}'
ORDER BY id DESC
LIMIT 1;`,
  });

  const existsNode = createIfNode({
    id: "brand-profile-exists",
    name: "Brand Profile Exists",
    position: [880, -140],
    leftValue: "={{ $json.id !== undefined }}",
  });

  const insertNode = createMySqlNode({
    id: "insert-brand-profile",
    name: "Insert Brand Profile",
    position: [1100, -20],
    query: `INSERT INTO brand_profiles (
  customer_id,
  brand_name,
  target_audience,
  brand_voice,
  products_services,
  default_cta,
  words_to_use,
  words_to_avoid
)
VALUES (
  {{ $('Validate Input').item.json.body.customer_id }},
  '{{ $('Validate Input').item.json.body.brand_name }}',
  '{{ $('Validate Input').item.json.body.target_audience }}',
  '{{ $('Validate Input').item.json.body.brand_voice }}',
  '{{ $('Validate Input').item.json.body.products_services }}',
  '{{ $('Validate Input').item.json.body.default_cta }}',
  '{{ $('Validate Input').item.json.body.words_to_use }}',
  '{{ $('Validate Input').item.json.body.words_to_avoid }}'
);`,
  });

  workflow.nodes.push(findExistingNode, existsNode, insertNode);

  setNodePosition(workflow, "MySQL", [1100, -260]);
  setNodePosition(workflow, "MySQL1", [1320, -140]);
  setNodePosition(workflow, "Respond to Webhook", [1540, -140]);

  setNodeQuery(
    workflow,
    "MySQL",
    `UPDATE brand_profiles
SET
  brand_name = '{{ $('Validate Input').item.json.body.brand_name }}',
  target_audience = '{{ $('Validate Input').item.json.body.target_audience }}',
  brand_voice = '{{ $('Validate Input').item.json.body.brand_voice }}',
  products_services = '{{ $('Validate Input').item.json.body.products_services }}',
  default_cta = '{{ $('Validate Input').item.json.body.default_cta }}',
  words_to_use = '{{ $('Validate Input').item.json.body.words_to_use }}',
  words_to_avoid = '{{ $('Validate Input').item.json.body.words_to_avoid }}'
WHERE id = {{ $('Find Existing Brand Profile').item.json.id }};`,
  );

  workflow.connections["Is Valid"] = {
    main: [
      [{ node: "Find Existing Brand Profile", type: "main", index: 0 }],
      [{ node: "Respond Validation Error", type: "main", index: 0 }],
    ],
  };
  workflow.connections["Find Existing Brand Profile"] = {
    main: [[{ node: "Brand Profile Exists", type: "main", index: 0 }]],
  };
  workflow.connections["Brand Profile Exists"] = {
    main: [
      [{ node: "MySQL", type: "main", index: 0 }],
      [{ node: "Insert Brand Profile", type: "main", index: 0 }],
    ],
  };
  workflow.connections.MySQL = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections["Insert Brand Profile"] = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections.MySQL1 = {
    main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
  };
}

function patchCreatePost(workflow) {
  addValidationGate(workflow, "create-post", createPostValidationCode(false));
  replaceBodyRefs(workflow);

  removeNodes(workflow, ["Find Existing Post", "Post Exists", "Insert Post"]);

  const findExistingNode = createMySqlNode({
    id: "find-existing-post",
    name: "Find Existing Post",
    position: [660, -140],
    query: `SELECT id
FROM posts
WHERE customer_id = {{ $('Validate Input').item.json.body.customer_id }}
  AND platform = '{{ $('Validate Input').item.json.body.platform }}'
  AND topic = '{{ $('Validate Input').item.json.body.topic }}'
  AND COALESCE(caption, '') = '{{ $('Validate Input').item.json.body.caption }}'
  AND COALESCE(hashtags, '') = '{{ $('Validate Input').item.json.body.hashtags }}'
  AND status = '{{ $('Validate Input').item.json.body.status }}'
  AND (
    (scheduled_at IS NULL AND NULLIF('{{ $('Validate Input').item.json.body.scheduled_at }}', '') IS NULL)
    OR scheduled_at = NULLIF('{{ $('Validate Input').item.json.body.scheduled_at }}', '')
  )
ORDER BY id DESC
LIMIT 1;`,
  });

  const existsNode = createIfNode({
    id: "post-exists",
    name: "Post Exists",
    position: [880, -140],
    leftValue: "={{ $json.id !== undefined }}",
  });

  const insertNode = createMySqlNode({
    id: "insert-post",
    name: "Insert Post",
    position: [1100, -20],
    query: `INSERT INTO posts (
  customer_id,
  platform,
  topic,
  caption,
  hashtags,
  status,
  scheduled_at
)
VALUES (
  {{ $('Validate Input').item.json.body.customer_id }},
  '{{ $('Validate Input').item.json.body.platform }}',
  '{{ $('Validate Input').item.json.body.topic }}',
  '{{ $('Validate Input').item.json.body.caption }}',
  '{{ $('Validate Input').item.json.body.hashtags }}',
  '{{ $('Validate Input').item.json.body.status }}',
  NULLIF('{{ $('Validate Input').item.json.body.scheduled_at }}', '')
);`,
  });

  workflow.nodes.push(findExistingNode, existsNode, insertNode);

  setNodePosition(workflow, "MySQL", [1100, -260]);
  setNodePosition(workflow, "MySQL1", [1320, -140]);
  setNodePosition(workflow, "Respond to Webhook", [1540, -140]);

  setNodeQuery(
    workflow,
    "MySQL",
    `UPDATE posts
SET
  caption = '{{ $('Validate Input').item.json.body.caption }}',
  hashtags = '{{ $('Validate Input').item.json.body.hashtags }}',
  status = '{{ $('Validate Input').item.json.body.status }}',
  scheduled_at = NULLIF('{{ $('Validate Input').item.json.body.scheduled_at }}', ''),
  updated_at = CURRENT_TIMESTAMP
WHERE id = {{ $('Find Existing Post').item.json.id }};`,
  );

  workflow.connections["Is Valid"] = {
    main: [
      [{ node: "Find Existing Post", type: "main", index: 0 }],
      [{ node: "Respond Validation Error", type: "main", index: 0 }],
    ],
  };
  workflow.connections["Find Existing Post"] = {
    main: [[{ node: "Post Exists", type: "main", index: 0 }]],
  };
  workflow.connections["Post Exists"] = {
    main: [
      [{ node: "MySQL", type: "main", index: 0 }],
      [{ node: "Insert Post", type: "main", index: 0 }],
    ],
  };
  workflow.connections.MySQL = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections["Insert Post"] = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections.MySQL1 = {
    main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
  };
}

function patchUpdateBrandProfile(workflow) {
  addValidationGate(
    workflow,
    "update-brand-profile",
    updateBrandProfileValidationCode(),
  );
  replaceBodyRefs(workflow);

  removeNodes(workflow, ["Find Brand Profile By Id", "Brand Profile Found", "Respond Not Found"]);

  const findNode = createMySqlNode({
    id: "find-brand-profile-by-id",
    name: "Find Brand Profile By Id",
    position: [660, -140],
    query: `SELECT id
FROM brand_profiles
WHERE id = {{ $('Validate Input').item.json.body.id }}
LIMIT 1;`,
  });

  const foundNode = createIfNode({
    id: "brand-profile-found",
    name: "Brand Profile Found",
    position: [880, -140],
    leftValue: "={{ $json.id !== undefined }}",
  });

  const notFoundNode = createRespondNode({
    id: "respond-brand-profile-not-found",
    name: "Respond Not Found",
    position: [1100, 20],
    responseBody:
      '={{ { success: false, message: "Brand profile not found", error: "The requested brand profile does not exist" } }}',
    responseCode: 404,
  });

  workflow.nodes.push(findNode, foundNode, notFoundNode);

  setNodePosition(workflow, "MySQL", [1100, -260]);
  setNodePosition(workflow, "MySQL1", [1320, -260]);
  setNodePosition(workflow, "Respond to Webhook", [1540, -260]);

  workflow.connections["Is Valid"] = {
    main: [
      [{ node: "Find Brand Profile By Id", type: "main", index: 0 }],
      [{ node: "Respond Validation Error", type: "main", index: 0 }],
    ],
  };
  workflow.connections["Find Brand Profile By Id"] = {
    main: [[{ node: "Brand Profile Found", type: "main", index: 0 }]],
  };
  workflow.connections["Brand Profile Found"] = {
    main: [
      [{ node: "MySQL", type: "main", index: 0 }],
      [{ node: "Respond Not Found", type: "main", index: 0 }],
    ],
  };
  workflow.connections.MySQL = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections.MySQL1 = {
    main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
  };
}

function patchUpdatePost(workflow) {
  addValidationGate(workflow, "update-post", createPostValidationCode(true));
  replaceBodyRefs(workflow);

  removeNodes(workflow, ["Find Post By Id", "Post Found", "Respond Not Found"]);

  const findNode = createMySqlNode({
    id: "find-post-by-id",
    name: "Find Post By Id",
    position: [660, -140],
    query: `SELECT id
FROM posts
WHERE id = {{ $('Validate Input').item.json.body.id }}
LIMIT 1;`,
  });

  const foundNode = createIfNode({
    id: "post-found",
    name: "Post Found",
    position: [880, -140],
    leftValue: "={{ $json.id !== undefined }}",
  });

  const notFoundNode = createRespondNode({
    id: "respond-post-not-found",
    name: "Respond Not Found",
    position: [1100, 20],
    responseBody:
      '={{ { success: false, message: "Post not found", error: "The requested post does not exist" } }}',
    responseCode: 404,
  });

  workflow.nodes.push(findNode, foundNode, notFoundNode);

  setNodePosition(workflow, "MySQL", [1100, -260]);
  setNodePosition(workflow, "MySQL1", [1320, -260]);
  setNodePosition(workflow, "Respond to Webhook", [1540, -260]);

  workflow.connections["Is Valid"] = {
    main: [
      [{ node: "Find Post By Id", type: "main", index: 0 }],
      [{ node: "Respond Validation Error", type: "main", index: 0 }],
    ],
  };
  workflow.connections["Find Post By Id"] = {
    main: [[{ node: "Post Found", type: "main", index: 0 }]],
  };
  workflow.connections["Post Found"] = {
    main: [
      [{ node: "MySQL", type: "main", index: 0 }],
      [{ node: "Respond Not Found", type: "main", index: 0 }],
    ],
  };
  workflow.connections.MySQL = {
    main: [[{ node: "MySQL1", type: "main", index: 0 }]],
  };
  workflow.connections.MySQL1 = {
    main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
  };
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

  replaceBodyRefs(workflow);
}

function createCustomerValidationCode() {
  return `const body = $json.body ?? {};
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

return [{ json: { valid: true, body: { name, email, company_name: companyName, industry } } }];`;
}

function saveBrandProfileValidationCode() {
  return `const body = $json.body ?? {};
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
}];`;
}

function updateBrandProfileValidationCode() {
  return `const body = $json.body ?? {};
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
}];`;
}

function createPostValidationCode(requireId) {
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
const caption = escapeSql(body.caption);
const hashtags = escapeSql(body.hashtags);
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
      caption,
      hashtags,
      status,
      scheduled_at: scheduledAt
    }
  }
}];`;
}

function addValidationGate(workflow, suffix, jsCode) {
  removeNodes(workflow, [
    "Validate Input",
    "Is Valid",
    "Respond Validation Error",
  ]);

  shiftNonWebhookNodes(workflow, 440);

  const validateNode = {
    parameters: { jsCode },
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [220, 0],
    id: `validate-${suffix}`,
    name: "Validate Input",
  };

  const ifNode = createIfNode({
    id: `if-${suffix}`,
    name: "Is Valid",
    position: [440, 0],
    leftValue: "={{ $json.valid }}",
  });

  const errorNode = createRespondNode({
    id: `respond-validation-error-${suffix}`,
    name: "Respond Validation Error",
    position: [660, 220],
    responseBody: "={{ $json.response }}",
    responseCode: 400,
  });

  workflow.nodes.push(validateNode, ifNode, errorNode);
  setNodePosition(workflow, "Webhook", [0, 0]);

  workflow.connections.Webhook = {
    main: [[{ node: "Validate Input", type: "main", index: 0 }]],
  };
  workflow.connections["Validate Input"] = {
    main: [[{ node: "Is Valid", type: "main", index: 0 }]],
  };
}

function createIfNode({ id, name, position, leftValue }) {
  return {
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
            id,
            leftValue,
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
    position,
    id,
    name,
  };
}

function createRespondNode({ id, name, position, responseBody, responseCode }) {
  return {
    parameters: {
      respondWith: "json",
      responseBody,
      options: { responseCode },
    },
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.2,
    position,
    id,
    name,
  };
}

function createMySqlNode({ id, name, position, query }) {
  const credentials = getNode(workflowTemplate(), "template").credentials;
  return {
    parameters: {
      operation: "executeQuery",
      query,
      options: {},
    },
    type: "n8n-nodes-base.mySql",
    typeVersion: 2.4,
    position,
    id,
    name,
    alwaysOutputData: true,
    credentials,
  };
}

function workflowTemplate() {
  return {
    nodes: [
      {
        name: "template",
        credentials: {
          mySql: {
            id: "BKYkXhg7gKhGGXMN",
            name: "MySQL account",
          },
        },
      },
    ],
  };
}

function replaceBodyRefs(workflow) {
  for (const node of workflow.nodes) {
    const query = node.parameters?.query;
    if (typeof query === "string") {
      node.parameters.query = query
        .replaceAll("$('Webhook').item.json.body", "$('Validate Input').item.json.body")
        .replaceAll('$("Webhook").item.json.body', '$("Validate Input").item.json.body')
        .replaceAll("$json.body", "$('Validate Input').item.json.body");
    }
  }
}

function removeNodes(workflow, nodeNames) {
  workflow.nodes = workflow.nodes.filter((node) => !nodeNames.includes(node.name));

  for (const key of Object.keys(workflow.connections)) {
    if (nodeNames.includes(key)) {
      delete workflow.connections[key];
      continue;
    }

    const main = workflow.connections[key]?.main;

    if (!Array.isArray(main)) {
      continue;
    }

    workflow.connections[key].main = main.map((branch) =>
      branch.filter((connection) => !nodeNames.includes(connection.node)),
    );
  }
}

function shiftNonWebhookNodes(workflow, deltaX) {
  for (const node of workflow.nodes) {
    if (node.name !== "Webhook") {
      node.position = [node.position[0] + deltaX, node.position[1]];
    }
  }
}

function setNodeQuery(workflow, nodeName, query) {
  getNode(workflow, nodeName).parameters.query = query;
}

function setNodePosition(workflow, nodeName, position) {
  getNode(workflow, nodeName).position = position;
}

function getNode(workflow, nodeName) {
  const node = workflow.nodes.find((item) => item.name === nodeName);

  if (!node) {
    throw new Error(`Missing node ${nodeName} in workflow ${workflow.name}`);
  }

  return node;
}
