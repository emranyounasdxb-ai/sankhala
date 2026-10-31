import { jobCategories } from "./job-categories";

export const categoryId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const ids = jobCategories.map((category) => categoryId(category.name));
export function browseState(search: string) {
  const params = new URLSearchParams(search);
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    open: (params.get("open") ?? "")
      .split(",")
      .filter((id) => ids.includes(id)),
  };
}
export function browseHref(q: string, open: string[], anchor = "") {
  const params = new URLSearchParams();
  if (q) params.set("q", q.slice(0, 80));
  const selected = ids.filter((id) => open.includes(id));
  if (selected.length) params.set("open", selected.join(","));
  return `/jobs${params.size ? `?${params}` : ""}${ids.includes(anchor) ? `#category-${anchor}` : ""}`;
}
export function safeJobsReturn(value: unknown) {
  if (typeof value !== "string" || value.length > 1800) return "/jobs";
  try {
    const url = new URL(value, "https://sankhala.invalid");
    if (url.origin !== "https://sankhala.invalid" || url.pathname !== "/jobs")
      return "/jobs";
    const state = browseState(url.search);
    return browseHref(state.q, state.open, url.hash.replace(/^#category-/, ""));
  } catch {
    return "/jobs";
  }
}
