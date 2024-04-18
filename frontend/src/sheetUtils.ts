interface GVizResponse {
  version: string;
  reqId: string;
  status: string;
  sig: string;
  table: GVizTable;
}

interface GVizTable {
  cols: GVizCol[];
  rows: GVizRow[];
  parsedNumHeaders: number;
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
export type TableMapping = Record<
  string,
  {
    name: string;
    query: string;
    mapping: ColumnMapping;
  }
>;

export type ParsedRow<M extends ColumnMapping> = {
  [K in keyof M as M[K]]: string;
};
export type ParsedSheet<M extends ColumnMapping> = ParsedRow<M>[];
export type ParsedWorkbook<M extends TableMapping> = {
  [K in keyof M as M[K]["name"]]: ParsedSheet<M[K]["mapping"]>;
};
export type SheetParameters = { key: string; gid: string };

export async function fetchWorkbook<T extends TableMapping>(
  key: string,
  tabs: GSheetTab[],
  tableMapping: T,
): Promise<ParsedWorkbook<T>> {
  const ret = {};
  const promises: Promise<void>[] = [];
  for (const [tabName, { name, query, mapping }] of Object.entries(
    tableMapping,
  )) {
    promises.push(
      new Promise(async (resolve) => {
        const { gid } = tabs.find((v) => v.name === tabName) ?? {};
        if (gid === undefined) {
          throw new Error(`Unable to extract sheet GID for ${tabName}`);
        }
        ret[name] = await fetchSheet(key, gid, query, mapping);
        resolve();
      }),
    );
  }
  await Promise.all(promises);
  return ret as ParsedWorkbook<T>;
}

export async function fetchSheet<T extends ColumnMapping>(
  key: string,
  gid: string,
  query: string,
  columnMapping: T,
): Promise<ParsedSheet<T>> {
  const queryUrl = new URL(
    `https://docs.google.com/spreadsheets/d/${key}/gviz/tq`,
  );
  queryUrl.searchParams.set("gid", gid);
  queryUrl.searchParams.set("tq", query);
  // Append a JS function of known length, so we can tear out the JSON easily
  queryUrl.searchParams.set("tqx", "responseHandler:remove");

  const response = await fetch(queryUrl);
  const responseString = await response.text();
  const parsed: GVizResponse = JSON.parse(
    responseString.substring(15, responseString.length - 2),
  );
  const keys = parsed.table.cols.map((cell) => columnMapping[cell.id]);

  // Always slice off at least one row for headers
  return parsed.table.rows
    .slice(1 - parsed.table.parsedNumHeaders)
    .filter((row) => row.c.every((c) => c != null)) // Make sure none of the resulting columns are null otherwise we will explode
    .map((row) => {
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
        ?.innerText?.slice?.(0, -" - Google Drive".length) ?? null
    );
  } catch {
    return null;
  }
}

export type GSheetTab = { name: string; gid: string };

export async function fetchSheetTabs(key: string): Promise<GSheetTab[]> {
  const url = new URL(
    "./sheetTabs",
    new URL(process.env.API_ROOT, window.location.href),
  );
  url.searchParams.set("key", key);
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error("Fetching sheet not OK");
  }
  return await response.json();
}
