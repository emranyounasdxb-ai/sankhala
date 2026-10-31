import { createHash, randomUUID } from "node:crypto";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";
import { AtsError } from "./http";
export type CheckedUpload = {
  id: string;
  storageKey: string;
  originalName: string;
  mime: string;
  size: number;
  sha256: string;
  kind: "cv" | "certificate";
  bytes: Buffer;
};
export async function privateRoot() {
  const root = path.resolve(
    /*turbopackIgnore: true*/
    process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private",
  );
  await mkdir(root, { recursive: true, mode: 0o700 });
  const resolved = await realpath(/*turbopackIgnore: true*/ root);
  const publicRoot = path.resolve("public");
  if (
    resolved === publicRoot ||
    resolved.startsWith(`${publicRoot}${path.sep}`)
  )
    throw new Error("Documents must be stored outside the public directory.");
  await mkdir(path.join(resolved, "documents"), {
    recursive: true,
    mode: 0o700,
  });
  return resolved;
}
export async function checkUpload(
  file: File,
  kind: CheckedUpload["kind"],
): Promise<CheckedUpload> {
  if (file.size < 20 || file.size > 6 * 1024 * 1024)
    throw new AtsError(422, "Each document must be between 20 bytes and 6 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase();
  let mime = "";
  if (ext === ".pdf" && bytes.subarray(0, 5).toString() === "%PDF-") {
    const text = bytes.toString("latin1");
    if (
      !text.includes("%%EOF") ||
      /\/(?:JavaScript|JS|OpenAction|AA|Launch|EmbeddedFile|RichMedia)\b/i.test(
        text,
      )
    )
      throw new AtsError(
        422,
        "Use a standard PDF without scripts, actions or embedded files.",
      );
    mime = "application/pdf";
  } else if (
    ext === ".docx" &&
    kind === "cv" &&
    bytes[0] === 80 &&
    bytes[1] === 75
  ) {
    let count = 0,
      total = 0;
    let files: ReturnType<typeof unzipSync>;
    try {
      files = unzipSync(bytes, {
        filter(entry) {
          count++;
          total += entry.originalSize;
          if (
            count > 250 ||
            total > 30 * 1024 * 1024 ||
            entry.originalSize > 8 * 1024 * 1024 ||
            /(?:vbaProject|embeddings|activeX)/i.test(entry.name)
          )
            throw new Error("Unsafe Office archive");
          return (
            entry.name === "word/document.xml" ||
            entry.name === "[Content_Types].xml" ||
            entry.name.endsWith(".rels")
          );
        },
      });
    } catch {
      throw new AtsError(
        422,
        "Use a valid DOCX under 6 MB without macros or embedded objects.",
      );
    }
    if (
      !files["word/document.xml"] ||
      !files["[Content_Types].xml"] ||
      Object.entries(files).some(
        ([name, value]) =>
          name.endsWith(".rels") &&
          /TargetMode\s*=\s*["']External/i.test(Buffer.from(value).toString()),
      )
    )
      throw new AtsError(
        422,
        "Use a self-contained DOCX without external document links.",
      );
    mime =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (
    kind === "certificate" &&
    ext === ".png" &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    mime = "image/png";
  else if (
    kind === "certificate" &&
    [".jpg", ".jpeg"].includes(ext) &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    mime = "image/jpeg";
  if (!mime)
    throw new AtsError(
      422,
      "Upload a PDF or DOCX CV. Certificates may be PDF, PNG or JPG.",
    );
  const id = randomUUID();
  return {
    id,
    storageKey: `${id}${ext}`,
    originalName: path
      .basename(file.name)
      .replace(/[\r\n]/g, "")
      .slice(0, 200),
    mime,
    size: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    kind,
    bytes,
  };
}
export async function storeUpload(file: CheckedUpload) {
  const root = await privateRoot();
  await writeFile(path.join(root, "documents", file.storageKey), file.bytes, {
    mode: 0o600,
    flag: "wx",
  });
}
export async function documentPath(key: string) {
  if (!/^[a-f0-9-]{36}\.(?:pdf|docx|png|jpe?g)$/.test(key))
    throw new Error("Invalid private storage key.");
  return path.join(await privateRoot(), "documents", key);
}
