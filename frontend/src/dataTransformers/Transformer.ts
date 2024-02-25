import {
  fetchSheet,
  GSheetTab,
  ParsedSheet,
  SheetParameters,
} from "../sheetUtils";
import { AllowedVersions } from "./index";

export default abstract class Transformer {
  static version: AllowedVersions;
  abstract query: string;
  abstract columnMapping: Record<string, string>;
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

  static extractGid(tabs: GSheetTab[]): string | null {
    return null;
  }

  abstract transform(data: ParsedSheet<typeof this.columnMapping>): unknown;
}
