interface GVizResponse {
  version: string;
  reqId: string;
  status: string;
  sig: string;
  table: GVizTable;
  parsedNumHeaders: number;
}

interface GVizTable {
  cols: GVizCol[];
  rows: GVizRow[];
}

interface GVizCol {
  id: string;
  label: string;
  type: string;
}

interface GVizRow {
  c: GVizCell[];
}

interface GVizCell {
  v: string | number;
  f?: string;
}

export type ColumnMapping = Record<string, string>;
export type ParsedRow<M extends ColumnMapping> = {
  [K in keyof M as M[K]]: string;
};
export type ParsedSheet<M extends ColumnMapping> = ParsedRow<M>[];
export type SheetParameters = { key: string; gid: string };

export async function fetchSheet<T extends ColumnMapping>(
  sheet: SheetParameters,
  query: string,
  columnMapping: T,
): Promise<ParsedSheet<T>> {
  const queryUrl = new URL(
    `https://docs.google.com/spreadsheets/d/${sheet.key}/gviz/tq`,
  );
  queryUrl.searchParams.set("gid", sheet.gid);
  queryUrl.searchParams.set("tq", query);
  // Append a JS function of known length, so we can tear out the JSON easily
  queryUrl.searchParams.set("tqx", "responseHandler:remove");

  const response = await fetch(queryUrl);
  const responseString = await response.text();
  const parsed: GVizResponse = JSON.parse(
    responseString.substring(15, responseString.length - 2),
  );
  const keys = parsed.table.cols.map((cell) => columnMapping[cell.id]);

  return parsed.table.rows.map((row) => {
    return row.c.reduce((acc, curr, idx) => {
      acc[keys[idx]] = (curr.v ?? "").toString();
      return acc;
    }, {} as ParsedRow<T>);
  });
}

const keyFormat = new RegExp("spreadsheets/d/([^/#]+)", "i");

export function extractSheetKey(sheetUrl: string): string | null {
  const key = sheetUrl.match(keyFormat);
  return key?.[1] ?? null;
}

export function parseDate(dateString: string) {
  return new Date(dateString.substring(5, dateString.length - 1));
}

async function fetchHTMLView(key: string) {
  const htmlViewURL = new URL(
    `https://docs.google.com/spreadsheets/d/${key}/htmlview`,
  );
  const response = await fetch(htmlViewURL, { redirect: "manual" });
  if (response.status !== 200) {
    throw new Error("Fetching sheet not OK");
  }
  const html = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export async function fetchSheetName(key: string): Promise<string | null> {
  try {
    const doc = await fetchHTMLView(key);
    return (
      doc
        .querySelector("title")
        ?.innerText?.slice?.(0, " - Google Drive".length) ?? null
    );
  } catch {
    return null;
  }
}

export type GSheetTab = { name: string; gid: string };

export async function fetchSheetTabs(key: string): Promise<GSheetTab[]> {
  const url = new URL("./sheetTabs", process.env.API_ROOT);
  url.searchParams.set("key", key);
  const response = await fetch(url);
  return await response.json();
}
