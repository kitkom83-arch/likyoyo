import { getPublicPageBySlug } from "@/lib/server/public-pages-store";

type SubmissionResponse = {
  id: string;
  label: string;
  value: string | string[];
};

type ForwardInput = {
  slug: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  responses: SubmissionResponse[];
};

type ForwardResult = {
  forwarded: boolean;
  ok?: boolean;
  status?: number;
  error?: string;
};

const WEBHOOK_TIMEOUT_MS = 8000;

/**
 * Look up the form's Google Apps Script webhook URL from the saved public page
 * (never trusted from the client) and forward the submission to it. Any failure
 * is swallowed so it never breaks the visitor's submit flow — the primary
 * storage path already succeeded by the time this runs.
 */
export const forwardSubmissionToSheetWebhook = async (
  input: ForwardInput,
): Promise<ForwardResult> => {
  let url: string | undefined;
  try {
    const page = await getPublicPageBySlug(input.slug);
    const link = page?.links.find((entry) => entry.id === input.formId);
    url = link?.form?.sheetWebhookUrl?.trim();
  } catch (error) {
    console.error("[form-sheet-webhook] page lookup failed", error);
    return { forwarded: false, error: "lookup_failed" };
  }

  if (!url) {
    return { forwarded: false };
  }
  if (!/^https:\/\//i.test(url)) {
    console.warn("[form-sheet-webhook] skipping non-https webhook url");
    return { forwarded: false, error: "invalid_url" };
  }

  const flatFields = input.responses.reduce<Record<string, string>>((accumulator, entry) => {
    const key = (entry.label || entry.id).trim();
    if (!key) {
      return accumulator;
    }
    accumulator[key] = Array.isArray(entry.value) ? entry.value.join(", ") : String(entry.value ?? "");
    return accumulator;
  }, {});

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      signal: controller.signal,
      body: JSON.stringify({
        submitted_at: input.submittedAt,
        slug: input.slug,
        form_id: input.formId,
        form_title: input.formTitle,
        responses: input.responses,
        fields: flatFields,
      }),
    });
    return { forwarded: true, ok: response.ok, status: response.status };
  } catch (error) {
    console.error("[form-sheet-webhook] forward failed", error);
    return { forwarded: true, ok: false, error: error instanceof Error ? error.message : "unknown" };
  } finally {
    clearTimeout(timeout);
  }
};
