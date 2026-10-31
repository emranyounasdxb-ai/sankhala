import { strToU8, zipSync } from "fflate";

export type ExportCell = string | number | null | undefined;
const clean = (value: ExportCell) =>
  Array.from(String(value ?? ""))
    .filter((character) => {
      const point = character.codePointAt(0) ?? 0;
      return (
        [9, 10, 13].includes(point) ||
        (point >= 32 && point <= 0xd7ff) ||
        (point >= 0xe000 && point <= 0xfffd) ||
        (point >= 0x10000 && point <= 0x10ffff)
      );
    })
    .slice(0, 16000)
    .join("");
const xml = (value: ExportCell) =>
  clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function exportCsv(headers: string[], rows: ExportCell[][]): Uint8Array {
  const cell = (value: ExportCell) => {
    const text = clean(value);
    const safe = /^[\s\uFEFF]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return strToU8(
    `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`,
  );
}

function column(index: number) {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Minimal standards-based XLSX export: cells are text, never formulas. */
export function exportXlsx(
  headers: string[],
  rows: ExportCell[][],
): Uint8Array {
  const sheet = [headers, ...rows]
    .map(
      (row, index) =>
        `<row r="${index + 1}">${row.map((value, cell) => `<c r="${column(cell)}${index + 1}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join("")}</row>`,
    )
    .join("");
  const files: Record<string, string> = {
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Applications" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${sheet}</sheetData><autoFilter ref="A1:${column(Math.max(headers.length - 1, 0))}${rows.length + 1}"/></worksheet>`,
  };
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([path, content]) => [path, strToU8(content)]),
    ),
    { level: 6 },
  );
}
