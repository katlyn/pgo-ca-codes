import {
  fetchWorkbook,
  GSheetTab,
  ParsedWorkbook,
  TableMapping,
} from "../sheetUtils";
import { AllowedVersions } from "./index";

export default abstract class Transformer {
  static version: AllowedVersions;
  abstract tableMapping: TableMapping;
  key: string;
  tabs: GSheetTab[];

  constructor(key: string, tabs: GSheetTab[]) {
    this.key = key;
    this.tabs = tabs;
  }

  async fetch(): Promise<ReturnType<typeof this.transform>> {
    const data = await fetchWorkbook(this.key, this.tabs, this.tableMapping);
    return this.transform(data);
  }

  static matchesVersion(tabs: GSheetTab[]): boolean {
    return false;
  }

  abstract transform(data: ParsedWorkbook<typeof this.tableMapping>): unknown;
}
