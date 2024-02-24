import {
  extractSheetParameters,
  fetchSheet,
  ParsedSheet,
  SheetParameters,
} from "../sheetUtils";

export default abstract class Transformer {
  query: string;
  columnMapping: Record<string, string>;
  sheetParameters: SheetParameters;

  constructor(sheetParameters: SheetParameters) {
    this.sheetParameters = sheetParameters;
  }

  async fetch(): Promise<ReturnType<typeof this.transform>> {
    const data = await fetchSheet(
      this.sheetParameters,
      this.query,
      this.columnMapping,
    );
    return this.transform(data);
  }

  abstract transform(data: ParsedSheet<typeof this.columnMapping>): unknown;
}
