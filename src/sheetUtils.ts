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

async function fetchEditView(key: string) {
  const htmlViewURL = new URL(
    `https://docs.google.com/spreadsheets/d/${key}/edit`,
  );
  const response = await fetch(htmlViewURL);
  const html = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export async function fetchSheetName(key: string): Promise<string | null> {
  const doc = await fetchEditView(key);
  return (
    doc.querySelector('[property="og:title"]')?.getAttribute?.("content") ??
    null
  );
}

export type GSheetTab = { name: string; gid: string };
const snapshotRegex = /topsnapshot":(.+),"revision"/;

export async function fetchSheetTabs(key: string): Promise<GSheetTab[]> {
  const doc = await fetchEditView(key);

  // Pull the script tag that has the bootstrap data out of the page
  const scriptElements = doc.querySelectorAll("script");
  const bootstrapScript = Array.from(scriptElements).find((el) =>
    el.innerText.includes("var bootstrapData"),
  );

  if (bootstrapScript === undefined) {
    throw new Error("Unable to extract bootstrap script!");
  }

  // Extract the "topsnapshot" array, so we can pull tab names and GIDs
  const bootstrapSnapshot = bootstrapScript.innerText.match(snapshotRegex);
  if (bootstrapSnapshot === null) {
    throw new Error("Unable to extract bootstrap topsnapshot!");
  }

  // Extract the tab data from the snapshot - there's no documentation about
  // what format this is, so this somewhat brute forces it. With luck, it won't
  // break any time soon.
  const snapshot: [number, string][] = JSON.parse(bootstrapSnapshot[1]);
  const tabSnapshotData = snapshot
    .map(([_, str]) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    })
    .filter(
      (v) =>
        v !== null &&
        Array.isArray(v) &&
        v[1] === 0 &&
        v?.[3]?.[0]?.[1]?.[0]?.[2] !== undefined,
    );

  // If these indexes seem insane it's because I went insane figuring them out
  return tabSnapshotData.map((v) => ({
    name: v[3][0][1][0][2],
    gid: v[2].toString(),
  }));
}
