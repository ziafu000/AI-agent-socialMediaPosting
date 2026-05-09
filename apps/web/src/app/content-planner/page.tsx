"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BrandProfileRecord,
  createPost,
  CustomerRecord,
  generateCaption,
  GeneratedContentIdea,
  generateContentIdeas,
  listBrandProfiles,
  listCustomers,
} from "@/lib/n8n-client";

type CustomersResponse = {
  success: boolean;
  customers: CustomerRecord[];
};

type BrandProfilesResponse = {
  success: boolean;
  brand_profiles: BrandProfileRecord[];
};

type PlannerForm = {
  customerId: string;
  brandProfileId: string;
  campaign: string;
  offer: string;
  callToAction: string;
  postsPerPlatform: string;
};

type DraftIdea = {
  id: string;
  platform: string;
  pillar: string;
  goal: string;
  topic: string;
  caption: string;
  hashtags: string;
  selected: boolean;
};

type PlannerMode = "manual" | "ai_stub";

type GeneratedIdeasResponse = {
  success: boolean;
  posts: GeneratedContentIdea[];
};

type GeneratedCaptionResponse = {
  success: boolean;
  caption: string;
  hashtags: string;
};

const initialFormState: PlannerForm = {
  customerId: "",
  brandProfileId: "",
  campaign: "",
  offer: "",
  callToAction: "",
  postsPerPlatform: "3",
};

const platformOptions = ["facebook", "instagram", "linkedin", "tiktok"];
const defaultPlatformSelection = platformOptions.reduce<Record<string, boolean>>(
  (selection, platform) => {
    selection[platform] = platform !== "tiktok";
    return selection;
  },
  {},
);

const defaultPillarSelection = {
  education: true,
  trust: true,
  engagement: true,
  conversion: true,
};

const pillarBlueprints = {
  education: {
    goal: "build_trust",
    topicTemplates: [
      "How {audience} can avoid {problem}",
      "A simple checklist before choosing {offer}",
      "Common mistakes people make with {offer}",
    ],
    captionTemplates: [
      "Break this down in simple terms for {audience}. Focus on one practical takeaway about {campaign}.",
      "Explain a misconception around {offer} and connect it back to {campaign}.",
      "Share a short educational post that makes {problem} easier to understand.",
    ],
  },
  trust: {
    goal: "proof",
    topicTemplates: [
      "What a strong {offer} process looks like",
      "Questions customers should ask before committing to {offer}",
      "Why consistency matters when solving {problem}",
    ],
    captionTemplates: [
      "Write a credibility-focused post that sounds {voice}. Show what careful execution looks like.",
      "Frame this as practical guidance for {audience}, with a calm and expert tone.",
      "Use a trust-building angle that reduces hesitation around {offer}.",
    ],
  },
  engagement: {
    goal: "conversation",
    topicTemplates: [
      "Which part of {campaign} is hardest for you right now?",
      "A quick opinion check for {audience}",
      "Myth or fact: what people believe about {problem}",
    ],
    captionTemplates: [
      "Write this as a conversation starter for {audience}. End with a clear prompt for comments.",
      "Keep it light and interactive while still matching a {voice} brand voice.",
      "Turn this into a question-led post that invites stories or opinions.",
    ],
  },
  conversion: {
    goal: "generate_leads",
    topicTemplates: [
      "When to take the next step on {offer}",
      "A limited-slot invitation around {campaign}",
      "Who gets the best result from {offer}",
    ],
    captionTemplates: [
      "Write a direct offer post for {audience}. Make the next step obvious.",
      "Keep the message concise, outcome-focused, and suitable for {platform}.",
      "Use a conversion angle tied to {campaign} with a strong close.",
    ],
  },
};

function normalizeText(value: string) {
  return value.trim();
}

function escapeTopic(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildHashtagSeed(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => `#${word}`)
    .join(" ");
}

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export default function ContentPlannerPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [profiles, setProfiles] = useState<BrandProfileRecord[]>([]);
  const [form, setForm] = useState<PlannerForm>(initialFormState);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    defaultPlatformSelection,
  );
  const [selectedPillars, setSelectedPillars] = useState(defaultPillarSelection);
  const [mode, setMode] = useState<PlannerMode>("manual");
  const [ideas, setIdeas] = useState<DraftIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [captionIdeaId, setCaptionIdeaId] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);

  const activeProfiles = useMemo(() => {
    const customerId = Number(form.customerId);

    if (!Number.isInteger(customerId) || customerId < 1) {
      return profiles;
    }

    return profiles.filter((profile) => profile.customer_id === customerId);
  }, [form.customerId, profiles]);

  const selectedProfile = useMemo(() => {
    const profileId = Number(form.brandProfileId);
    return activeProfiles.find((profile) => profile.id === profileId) ?? null;
  }, [activeProfiles, form.brandProfileId]);

  async function loadPlannerData() {
    setIsLoading(true);
    setError("");

    try {
      const [customersResponse, profilesResponse] = (await Promise.all([
        listCustomers(),
        listBrandProfiles(),
      ])) as [CustomersResponse, BrandProfilesResponse];

      const nextCustomers = customersResponse.customers ?? [];
      const nextProfiles = profilesResponse.brand_profiles ?? [];

      startTransition(() => {
        setCustomers(nextCustomers);
        setProfiles(nextProfiles);
        setForm((currentForm) => {
          const customerId =
            currentForm.customerId || String(nextCustomers[0]?.id ?? "");
          const matchingProfiles = nextProfiles.filter(
            (profile) => String(profile.customer_id) === customerId,
          );
          const brandProfileId =
            matchingProfiles.find(
              (profile) => String(profile.id) === currentForm.brandProfileId,
            )?.id ??
            matchingProfiles[0]?.id ??
            "";

          return {
            ...currentForm,
            customerId,
            brandProfileId: brandProfileId ? String(brandProfileId) : "",
          };
        });
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading planner data",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPlannerData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateField(field: keyof PlannerForm, value: string) {
    setForm((currentForm) => {
      if (field !== "customerId") {
        return {
          ...currentForm,
          [field]: value,
        };
      }

      const matchingProfiles = profiles.filter(
        (profile) => String(profile.customer_id) === value,
      );

      return {
        ...currentForm,
        customerId: value,
        brandProfileId: matchingProfiles[0] ? String(matchingProfiles[0].id) : "",
      };
    });
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((currentSelection) => ({
      ...currentSelection,
      [platform]: !currentSelection[platform],
    }));
  }

  function togglePillar(pillar: keyof typeof defaultPillarSelection) {
    setSelectedPillars((currentSelection) => ({
      ...currentSelection,
      [pillar]: !currentSelection[pillar],
    }));
  }

  function generateIdeas() {
    setError("");
    setResult(null);

    const customerId = Number(form.customerId);
    const postsPerPlatform = Number(form.postsPerPlatform);
    const activePlatformList = platformOptions.filter(
      (platform) => selectedPlatforms[platform],
    );
    const activePillarList = Object.entries(selectedPillars)
      .filter(([, isSelected]) => isSelected)
      .map(([pillar]) => pillar as keyof typeof pillarBlueprints);

    if (!Number.isInteger(customerId) || customerId < 1) {
      setError("Select a customer before generating ideas");
      return;
    }

    if (!selectedProfile) {
      setError("Select a brand profile before generating ideas");
      return;
    }

    if (!Number.isInteger(postsPerPlatform) || postsPerPlatform < 1) {
      setError("Posts per platform must be a positive number");
      return;
    }

    if (activePlatformList.length === 0) {
      setError("Select at least one platform");
      return;
    }

    if (activePillarList.length === 0) {
      setError("Select at least one content pillar");
      return;
    }

    const audience =
      normalizeText(selectedProfile.target_audience) || "your target audience";
    const voice = normalizeText(selectedProfile.brand_voice) || "clear";
    const campaign = normalizeText(form.campaign) || selectedProfile.brand_name;
    const offer =
      normalizeText(form.offer) || selectedProfile.products_services || "your offer";
    const callToAction =
      normalizeText(form.callToAction) ||
      normalizeText(selectedProfile.default_cta) ||
      "Send a message to learn more";
    const problems = normalizeText(selectedProfile.words_to_avoid)
      ? selectedProfile.words_to_avoid
      : selectedProfile.products_services || selectedProfile.brand_name;
    const preferredWords =
      normalizeText(selectedProfile.words_to_use) || selectedProfile.brand_name;

    const nextIdeas: DraftIdea[] = [];

    activePlatformList.forEach((platform) => {
      for (let index = 0; index < postsPerPlatform; index += 1) {
        const pillar = activePillarList[index % activePillarList.length];
        const blueprint = pillarBlueprints[pillar];
        const topicTemplate =
          blueprint.topicTemplates[index % blueprint.topicTemplates.length];
        const captionTemplate =
          blueprint.captionTemplates[index % blueprint.captionTemplates.length];
        const values = {
          audience,
          voice,
          campaign,
          offer,
          platform,
          problem: problems,
        };
        const topic = escapeTopic(fillTemplate(topicTemplate, values));
        const caption = `${fillTemplate(captionTemplate, values)} CTA: ${callToAction}. Preferred language: ${preferredWords}.`;
        const hashtags = [
          buildHashtagSeed(platform),
          buildHashtagSeed(campaign),
          buildHashtagSeed(selectedProfile.brand_name),
        ]
          .filter(Boolean)
          .join(" ");

        nextIdeas.push({
          id: `${platform}-${pillar}-${index + 1}`,
          platform,
          pillar,
          goal: blueprint.goal,
          topic,
          caption,
          hashtags,
          selected: true,
        });
      }
    });

    setIdeas(nextIdeas);
  }

  async function generateAiIdeas() {
    setError("");
    setResult(null);

    const customerId = Number(form.customerId);
    const brandProfileId = Number(form.brandProfileId);
    const postsPerPlatform = Number(form.postsPerPlatform);
    const activePlatformList = platformOptions.filter(
      (platform) => selectedPlatforms[platform],
    );
    const activePillarList = Object.entries(selectedPillars)
      .filter(([, isSelected]) => isSelected)
      .map(([pillar]) => pillar);

    if (!Number.isInteger(customerId) || customerId < 1) {
      setError("Select a customer before generating ideas");
      return;
    }

    if (!Number.isInteger(brandProfileId) || brandProfileId < 1) {
      setError("Select a brand profile before generating ideas");
      return;
    }

    if (!Number.isInteger(postsPerPlatform) || postsPerPlatform < 1) {
      setError("Posts per platform must be a positive number");
      return;
    }

    if (activePlatformList.length === 0) {
      setError("Select at least one platform");
      return;
    }

    if (activePillarList.length === 0) {
      setError("Select at least one content pillar");
      return;
    }

    setIsGeneratingAi(true);

    try {
      const response = (await generateContentIdeas({
        customer_id: customerId,
        brand_profile_id: brandProfileId,
        platforms: activePlatformList,
        content_pillars: activePillarList,
        number_of_posts: postsPerPlatform,
        campaign: form.campaign,
        offer: form.offer,
        call_to_action: form.callToAction,
      })) as GeneratedIdeasResponse;

      const nextIdeas = (response.posts ?? []).map((idea, index) => ({
        id: `ai-${idea.platform}-${idea.content_pillar}-${index + 1}`,
        platform: idea.platform,
        pillar: idea.content_pillar,
        goal: idea.goal,
        topic: idea.topic,
        caption: idea.caption,
        hashtags: idea.hashtags,
        selected: true,
      }));

      setIdeas(nextIdeas);
      setResult({
        success: true,
        message: "AI stub ideas generated successfully",
        generated_count: nextIdeas.length,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while generating AI ideas",
      );
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function toggleIdeaSelection(ideaId: string) {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, selected: !idea.selected } : idea,
      ),
    );
  }

  function updateIdea(ideaId: string, field: keyof DraftIdea, value: string) {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, [field]: value } : idea,
      ),
    );
  }

  async function generateCaptionForIdea(idea: DraftIdea) {
    const customerId = Number(form.customerId);
    const brandProfileId = Number(form.brandProfileId);

    if (!Number.isInteger(customerId) || customerId < 1) {
      setError("Select a valid customer before generating a caption");
      return;
    }

    if (!Number.isInteger(brandProfileId) || brandProfileId < 1 || !selectedProfile) {
      setError("Select a valid brand profile before generating a caption");
      return;
    }

    setCaptionIdeaId(idea.id);
    setError("");
    setResult(null);

    try {
      const response = (await generateCaption({
        customer_id: customerId,
        brand_profile_id: brandProfileId,
        brand_name: selectedProfile.brand_name,
        target_audience: selectedProfile.target_audience,
        brand_voice: selectedProfile.brand_voice,
        default_cta: selectedProfile.default_cta,
        words_to_use: selectedProfile.words_to_use,
        platform: idea.platform,
        topic: idea.topic,
        content_pillar: idea.pillar,
        goal: idea.goal,
        campaign: form.campaign,
        offer: form.offer,
        call_to_action: form.callToAction,
      })) as GeneratedCaptionResponse;

      setIdeas((currentIdeas) =>
        currentIdeas.map((currentIdea) =>
          currentIdea.id === idea.id
            ? {
                ...currentIdea,
                caption: response.caption,
                hashtags: response.hashtags || currentIdea.hashtags,
              }
            : currentIdea,
        ),
      );

      setResult({
        success: true,
        message: "Caption generated successfully",
        idea_id: idea.id,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while generating caption",
      );
    } finally {
      setCaptionIdeaId("");
    }
  }

  async function saveSelectedIdeas() {
    const customerId = Number(form.customerId);
    const selectedIdeas = ideas.filter((idea) => idea.selected);

    if (!Number.isInteger(customerId) || customerId < 1) {
      setError("Select a valid customer before saving");
      return;
    }

    if (selectedIdeas.length === 0) {
      setError("Select at least one idea to save");
      return;
    }

    setIsSaving(true);
    setError("");
    setResult(null);

    try {
      for (const idea of selectedIdeas) {
        await createPost({
          customer_id: customerId,
          platform: idea.platform,
          topic: idea.topic,
          caption: idea.caption,
          hashtags: idea.hashtags,
          status: "needs_review",
          scheduled_at: "",
        });
      }

      setResult({
        success: true,
        message: "Planner ideas saved as post drafts",
        saved_count: selectedIdeas.length,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while saving planner ideas",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const selectedIdeaCount = ideas.filter((idea) => idea.selected).length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Content Planner
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Build ideas from saved brand context, then push the selected ideas
              into post drafts through n8n.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700">Mode</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    mode === "manual"
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                  type="button"
                  onClick={() => setMode("manual")}
                >
                  Manual planner
                </button>
                <button
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    mode === "ai_stub"
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                  type="button"
                  onClick={() => setMode("ai_stub")}
                >
                  AI stub
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {mode === "manual"
                  ? "Manual planner uses local templates in the frontend."
                  : "AI stub calls the generate-content-ideas webhook. Later, only the stub node in n8n needs to be replaced with a real model node."}
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Customer</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={form.customerId}
                onChange={(event) => updateField("customerId", event.target.value)}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} #{customer.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Brand profile
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={form.brandProfileId}
                onChange={(event) =>
                  updateField("brandProfileId", event.target.value)
                }
              >
                <option value="">Select brand profile</option>
                {activeProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.brand_name} #{profile.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Campaign focus
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="June skincare education"
                type="text"
                value={form.campaign}
                onChange={(event) => updateField("campaign", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Offer or service
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Acne treatment package"
                type="text"
                value={form.offer}
                onChange={(event) => updateField("offer", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Call to action
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Book a consultation"
                type="text"
                value={form.callToAction}
                onChange={(event) =>
                  updateField("callToAction", event.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Posts per platform
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                min="1"
                max="8"
                type="number"
                value={form.postsPerPlatform}
                onChange={(event) =>
                  updateField("postsPerPlatform", event.target.value)
                }
              />
            </label>

            <div>
              <div className="text-sm font-medium text-slate-700">Platforms</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {platformOptions.map((platform) => (
                  <label
                    className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    key={platform}
                  >
                    <input
                      checked={selectedPlatforms[platform]}
                      type="checkbox"
                      onChange={() => togglePlatform(platform)}
                    />
                    <span className="capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700">
                Content pillars
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.keys(defaultPillarSelection).map((pillar) => (
                  <label
                    className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    key={pillar}
                  >
                    <input
                      checked={
                        selectedPillars[pillar as keyof typeof defaultPillarSelection]
                      }
                      type="checkbox"
                      onChange={() =>
                        togglePillar(
                          pillar as keyof typeof defaultPillarSelection,
                        )
                      }
                    />
                    <span className="capitalize">{pillar}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {mode === "manual" ? (
                <button
                  className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isLoading}
                  type="button"
                  onClick={generateIdeas}
                >
                  Generate manual ideas
                </button>
              ) : (
                <button
                  className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isLoading || isGeneratingAi}
                  type="button"
                  onClick={generateAiIdeas}
                >
                  {isGeneratingAi ? "Generating..." : "Generate AI stub ideas"}
                </button>
              )}
              <button
                className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isLoading}
                type="button"
                onClick={loadPlannerData}
              >
                {isLoading ? "Loading..." : "Refresh source data"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Planned ideas
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Review the generated angles, adjust the wording, then save the selected
                items as `needs_review` post drafts. You can also regenerate a caption
                on each idea card.
              </p>
            </div>
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving || selectedIdeaCount === 0}
              type="button"
              onClick={saveSelectedIdeas}
            >
              {isSaving
                ? "Saving..."
                : `Save selected drafts (${selectedIdeaCount})`}
            </button>
          </div>

          {error && (
            <pre className="mb-4 overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
              {JSON.stringify({ success: false, message: error }, null, 2)}
            </pre>
          )}

          {result && (
            <pre className="mb-4 overflow-auto rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          {selectedProfile && (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                <span className="font-medium text-slate-900">Brand:</span>{" "}
                {selectedProfile.brand_name}
              </div>
              <div className="mt-1">
                <span className="font-medium text-slate-900">Audience:</span>{" "}
                {selectedProfile.target_audience || "Not set"}
              </div>
              <div className="mt-1">
                <span className="font-medium text-slate-900">Voice:</span>{" "}
                {selectedProfile.brand_voice || "Not set"}
              </div>
            </div>
          )}

          {ideas.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No ideas generated yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <article
                  className="rounded-md border border-slate-200 p-4"
                  key={idea.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <input
                        checked={idea.selected}
                        type="checkbox"
                        onChange={() => toggleIdeaSelection(idea.id)}
                      />
                      Save this draft
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {idea.platform}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {idea.pillar}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {idea.goal}
                      </span>
                    </div>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-slate-700">
                      Topic
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      type="text"
                      value={idea.topic}
                      onChange={(event) =>
                        updateIdea(idea.id, "topic", event.target.value)
                      }
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-slate-700">
                      Caption brief
                    </span>
                    <button
                      className="mt-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                      disabled={captionIdeaId === idea.id}
                      type="button"
                      onClick={() => generateCaptionForIdea(idea)}
                    >
                      {captionIdeaId === idea.id
                        ? "Generating caption..."
                        : "Generate caption"}
                    </button>
                    <textarea
                      className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      value={idea.caption}
                      onChange={(event) =>
                        updateIdea(idea.id, "caption", event.target.value)
                      }
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-slate-700">
                      Hashtags
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      type="text"
                      value={idea.hashtags}
                      onChange={(event) =>
                        updateIdea(idea.id, "hashtags", event.target.value)
                      }
                    />
                  </label>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
