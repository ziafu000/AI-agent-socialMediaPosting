const endpoints = {
  customers: process.env.N8N_LIST_CUSTOMERS_URL ?? "http://localhost:5678/webhook/list-customers",
  brandProfiles:
    process.env.N8N_LIST_BRAND_PROFILES_URL ??
    "http://localhost:5678/webhook/list-brand-profiles",
  posts: process.env.N8N_LIST_POSTS_URL ?? "http://localhost:5678/webhook/list-posts",
};

const [customersResponse, brandProfilesResponse, postsResponse] = await Promise.all([
  postJson(endpoints.customers, {}),
  postJson(endpoints.brandProfiles, {}),
  postJson(endpoints.posts, {}),
]);

const customers = customersResponse.customers ?? [];
const brandProfiles = brandProfilesResponse.brand_profiles ?? [];
const posts = postsResponse.posts ?? [];

const report = {
  totals: {
    customers: customers.length,
    brand_profiles: brandProfiles.length,
    posts: posts.length,
  },
  suspicious_customers: customers.filter(
    (customer) =>
      isSuspiciousText(customer.name) ||
      isSuspiciousText(customer.company_name) ||
      !isLikelyEmail(customer.email),
  ),
  duplicate_brand_profiles: findDuplicates(
    brandProfiles,
    (profile) => `${profile.customer_id}::${normalize(profile.brand_name)}`,
  ),
  duplicate_posts: findDuplicates(
    posts,
    (post) =>
      [
        post.customer_id,
        normalize(post.platform),
        normalize(post.topic),
        normalize(post.caption),
        normalize(post.hashtags),
        normalize(post.status),
        normalize(post.scheduled_at),
      ].join("::"),
  ),
};

console.log(JSON.stringify(report, null, 2));

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed request ${url}: ${response.status}`);
  }

  return response.json();
}

function findDuplicates(items, getKey) {
  const groups = new Map();

  for (const item of items) {
    const key = getKey(item);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      key,
      total: group.length,
      ids: group.map((item) => item.id),
    }));
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isLikelyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

function isSuspiciousText(value) {
  const normalized = normalize(value);

  if (!normalized) {
    return false;
  }

  return (
    normalized.length < 3 ||
    normalized.includes("test") ||
    normalized.includes("debug") ||
    normalized.includes("audit")
  );
}
