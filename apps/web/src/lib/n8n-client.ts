export type CreateCustomerPayload = {
  name: string;
  email: string;
  company_name: string;
  industry: string;
};

type N8nErrorResponse = {
  success?: boolean;
  message?: unknown;
  error?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPlatforms = ["facebook", "instagram", "linkedin", "tiktok"];
const allowedPostStatuses = [
  "draft",
  "needs_review",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
];

function toN8nErrorMessage(data: unknown, fallbackMessage: string) {
  if (!data || typeof data !== "object") {
    return fallbackMessage;
  }

  const errorData = data as N8nErrorResponse;
  const message =
    typeof errorData.message === "string" ? errorData.message : fallbackMessage;
  const error = typeof errorData.error === "string" ? errorData.error : "";

  return error ? `${message}: ${error}` : message;
}

function requireText(value: string, fieldName: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldName} is required`);
  }

  return trimmedValue;
}

function optionalText(value: string) {
  return value.trim();
}

function requireEmail(value: string) {
  const email = requireText(value, "Email").toLowerCase();

  if (!emailPattern.test(email)) {
    throw new Error("Email format is invalid");
  }

  return email;
}

function requirePositiveInteger(value: number, fieldName: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return value;
}

function requireAllowedValue(
  value: string,
  fieldName: string,
  allowedValues: string[],
) {
  const normalizedValue = requireText(value, fieldName).toLowerCase();

  if (!allowedValues.includes(normalizedValue)) {
    throw new Error(`${fieldName} is invalid`);
  }

  return normalizedValue;
}

function normalizeScheduledAt(value: string, status: string) {
  const scheduledAt = value.trim();

  if (status === "scheduled" && !scheduledAt) {
    throw new Error("Scheduled at is required when status is scheduled");
  }

  if (scheduledAt && Number.isNaN(Date.parse(scheduledAt))) {
    throw new Error("Scheduled at is invalid");
  }

  return scheduledAt;
}

async function postToN8n<TResponse>(
  webhookUrl: string | undefined,
  payload: unknown,
  errorMessage: string,
) {
  if (!webhookUrl) {
    throw new Error("Missing n8n webhook URL");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  const rawBody = await response.text();

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    throw new Error("n8n returned an invalid JSON response");
  }

  if (!response.ok || (data as N8nErrorResponse | null)?.success === false) {
    throw new Error(toN8nErrorMessage(data, errorMessage));
  }

  return data as TResponse;
}

export async function createCustomer(payload: CreateCustomerPayload) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL,
    {
      name: requireText(payload.name, "Name"),
      email: requireEmail(payload.email),
      company_name: optionalText(payload.company_name),
      industry: optionalText(payload.industry),
    },
    "Failed to create customer",
  );
}

export type CustomerRecord = {
  id: number;
  name: string;
  email: string;
  company_name: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
  brand_profile_count?: number;
  post_count?: number;
};

export async function listCustomers() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL,
    {},
    "Failed to load customers",
  );
}

export async function getCustomerDetail(customerId: number) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_GET_CUSTOMER_DETAIL_WEBHOOK_URL,
    { customer_id: requirePositiveInteger(customerId, "Customer ID") },
    "Failed to load customer detail",
  );
}

export type SaveBrandProfilePayload = {
  customer_id: number;
  brand_name: string;
  target_audience: string;
  brand_voice: string;
  products_services: string;
  default_cta: string;
  words_to_use: string;
  words_to_avoid: string;
};

export async function saveBrandProfile(payload: SaveBrandProfilePayload) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_SAVE_BRAND_PROFILE_WEBHOOK_URL,
    {
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      brand_name: requireText(payload.brand_name, "Brand name"),
      target_audience: optionalText(payload.target_audience),
      brand_voice: optionalText(payload.brand_voice),
      products_services: optionalText(payload.products_services),
      default_cta: optionalText(payload.default_cta),
      words_to_use: optionalText(payload.words_to_use),
      words_to_avoid: optionalText(payload.words_to_avoid),
    },
    "Failed to save brand profile",
  );
}

export type BrandProfileRecord = SaveBrandProfilePayload & {
  id: number;
  created_at: string;
  updated_at: string;
  customer_name?: string | null;
};

export type UpdateBrandProfilePayload = SaveBrandProfilePayload & {
  id: number;
};

export async function listBrandProfiles() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_LIST_BRAND_PROFILES_WEBHOOK_URL,
    {},
    "Failed to load brand profiles",
  );
}

export async function updateBrandProfile(payload: UpdateBrandProfilePayload) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_UPDATE_BRAND_PROFILE_WEBHOOK_URL,
    {
      id: requirePositiveInteger(payload.id, "Brand profile ID"),
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      brand_name: requireText(payload.brand_name, "Brand name"),
      target_audience: optionalText(payload.target_audience),
      brand_voice: optionalText(payload.brand_voice),
      products_services: optionalText(payload.products_services),
      default_cta: optionalText(payload.default_cta),
      words_to_use: optionalText(payload.words_to_use),
      words_to_avoid: optionalText(payload.words_to_avoid),
    },
    "Failed to update brand profile",
  );
}

export type CreatePostPayload = {
  customer_id: number;
  platform: string;
  topic: string;
  caption: string;
  hashtags: string;
  status: string;
  scheduled_at: string;
};

export async function createPost(payload: CreatePostPayload) {
  const status = requireAllowedValue(
    payload.status,
    "Status",
    allowedPostStatuses,
  );

  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_CREATE_POST_WEBHOOK_URL,
    {
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      platform: requireAllowedValue(
        payload.platform,
        "Platform",
        allowedPlatforms,
      ),
      topic: requireText(payload.topic, "Topic"),
      caption: optionalText(payload.caption),
      hashtags: optionalText(payload.hashtags),
      status,
      scheduled_at: normalizeScheduledAt(payload.scheduled_at, status),
    },
    "Failed to create post",
  );
}

export type GenerateContentIdeasPayload = {
  customer_id: number;
  brand_profile_id: number;
  platforms: string[];
  content_pillars: string[];
  number_of_posts: number;
  campaign: string;
  offer: string;
  call_to_action: string;
};

export type GeneratedContentIdea = {
  platform: string;
  topic: string;
  content_pillar: string;
  goal: string;
  caption: string;
  hashtags: string;
};

export async function generateContentIdeas(
  payload: GenerateContentIdeasPayload,
) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_GENERATE_CONTENT_IDEAS_WEBHOOK_URL,
    {
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      brand_profile_id: requirePositiveInteger(
        payload.brand_profile_id,
        "Brand profile ID",
      ),
      platforms: payload.platforms.map((platform) =>
        requireAllowedValue(platform, "Platform", allowedPlatforms),
      ),
      content_pillars: payload.content_pillars.map((pillar) =>
        requireText(pillar, "Content pillar").toLowerCase(),
      ),
      number_of_posts: requirePositiveInteger(
        payload.number_of_posts,
        "Number of posts",
      ),
      campaign: optionalText(payload.campaign),
      offer: optionalText(payload.offer),
      call_to_action: optionalText(payload.call_to_action),
    },
    "Failed to generate content ideas",
  );
}

export type GenerateCaptionPayload = {
  customer_id: number;
  brand_profile_id: number;
  brand_name: string;
  target_audience: string;
  brand_voice: string;
  default_cta: string;
  words_to_use: string;
  platform: string;
  topic: string;
  content_pillar: string;
  goal: string;
  campaign: string;
  offer: string;
  call_to_action: string;
};

export type GenerateCaptionResponse = {
  success: boolean;
  caption: string;
  hashtags: string;
};

export async function generateCaption(payload: GenerateCaptionPayload) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL,
    {
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      brand_profile_id: requirePositiveInteger(
        payload.brand_profile_id,
        "Brand profile ID",
      ),
      brand_name: requireText(payload.brand_name, "Brand name"),
      target_audience: optionalText(payload.target_audience),
      brand_voice: optionalText(payload.brand_voice),
      default_cta: optionalText(payload.default_cta),
      words_to_use: optionalText(payload.words_to_use),
      platform: requireAllowedValue(payload.platform, "Platform", allowedPlatforms),
      topic: requireText(payload.topic, "Topic"),
      content_pillar: requireText(
        payload.content_pillar,
        "Content pillar",
      ).toLowerCase(),
      goal: requireText(payload.goal, "Goal").toLowerCase(),
      campaign: optionalText(payload.campaign),
      offer: optionalText(payload.offer),
      call_to_action: optionalText(payload.call_to_action),
    },
    "Failed to generate caption",
  );
}

export type RewriteCaptionStyle =
  | "shorter"
  | "more_engaging"
  | "more_professional"
  | "more_sales_focused";

export type RewriteCaptionPayload = GenerateCaptionPayload & {
  current_caption: string;
  current_hashtags: string;
  rewrite_style: RewriteCaptionStyle;
};

export type RewriteCaptionResponse = GenerateCaptionResponse;

export async function rewriteCaption(payload: RewriteCaptionPayload) {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL,
    {
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      brand_profile_id: requirePositiveInteger(
        payload.brand_profile_id,
        "Brand profile ID",
      ),
      brand_name: requireText(payload.brand_name, "Brand name"),
      target_audience: optionalText(payload.target_audience),
      brand_voice: optionalText(payload.brand_voice),
      default_cta: optionalText(payload.default_cta),
      words_to_use: optionalText(payload.words_to_use),
      platform: requireAllowedValue(
        payload.platform,
        "Platform",
        allowedPlatforms,
      ),
      topic: requireText(payload.topic, "Topic"),
      content_pillar: requireText(
        payload.content_pillar,
        "Content pillar",
      ).toLowerCase(),
      goal: requireText(payload.goal, "Goal").toLowerCase(),
      campaign: optionalText(payload.campaign),
      offer: optionalText(payload.offer),
      call_to_action: optionalText(payload.call_to_action),
      current_caption: requireText(payload.current_caption, "Current caption"),
      current_hashtags: optionalText(payload.current_hashtags),
      rewrite_style: requireAllowedValue(payload.rewrite_style, "Rewrite style", [
        "shorter",
        "more_engaging",
        "more_professional",
        "more_sales_focused",
      ]) as RewriteCaptionStyle,
    },
    "Failed to rewrite caption",
  );
}

export type UpdatePostPayload = {
  id: number;
  customer_id: number;
  platform: string;
  topic: string;
  caption: string;
  hashtags: string;
  status: string;
  scheduled_at: string;
};

export async function updatePost(payload: UpdatePostPayload) {
  const status = requireAllowedValue(
    payload.status,
    "Status",
    allowedPostStatuses,
  );

  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_UPDATE_POST_WEBHOOK_URL,
    {
      id: requirePositiveInteger(payload.id, "Post ID"),
      customer_id: requirePositiveInteger(payload.customer_id, "Customer ID"),
      platform: requireAllowedValue(
        payload.platform,
        "Platform",
        allowedPlatforms,
      ),
      topic: requireText(payload.topic, "Topic"),
      caption: optionalText(payload.caption),
      hashtags: optionalText(payload.hashtags),
      status,
      scheduled_at: normalizeScheduledAt(payload.scheduled_at, status),
    },
    "Failed to update post",
  );
}

export type PostRecord = {
  id: number;
  customer_id: number;
  platform: string;
  topic: string;
  caption: string | null;
  hashtags: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
};

export async function listPosts() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_LIST_POSTS_WEBHOOK_URL,
    {},
    "Failed to load posts",
  );
}

export type WorkflowLog = {
  id: number;
  workflow_name: string;
  event_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

export async function listWorkflowLogs() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_LIST_WORKFLOW_LOGS_WEBHOOK_URL,
    {},
    "Failed to load workflow logs",
  );
}

export type ScheduledPost = PostRecord;

export async function listScheduledPosts() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_LIST_SCHEDULED_POSTS_WEBHOOK_URL,
    {},
    "Failed to load scheduled posts",
  );
}

export async function runScheduleSimulation() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_RUN_SCHEDULE_SIMULATION_WEBHOOK_URL,
    {},
    "Failed to run schedule simulation",
  );
}

export type DashboardSummary = {
  customer_count: number;
  brand_profile_count: number;
  post_count: number;
  draft_count: number;
  scheduled_count: number;
  published_count: number;
  failed_count: number;
  workflow_log_count: number;
};

export async function getDashboardSummary() {
  return postToN8n(
    process.env.NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL,
    {},
    "Failed to load dashboard summary",
  );
}
