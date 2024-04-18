import Transformer from "./Transformer";
import {
  GSheetTab,
  parseDate,
  ParsedSheet,
  ParsedWorkbook,
} from "../sheetUtils";
import { AllowedVersions } from "./index";

export interface Community {
  name: string;
  date: Date;
  codes: string[];
}

export interface CommunityEvent {
  name: string;
}

export type FallbackTransformed = Record<string, Community>;

const baseTableMapping = {
  name: "codes",
  query: "SELECT A,B,E",
  mapping: {
    A: "communityName",
    B: "date",
    E: "codes",
  },
} as const;

export class Fallback extends Transformer {
  static version = "Fallback" as AllowedVersions;
  tableMapping: Record<string, typeof baseTableMapping> = {};

  async fetch(): Promise<FallbackTransformed> {
    let tabName = "Sheet2";
    if (this.tabs.find((v) => v.name === tabName)) {
      tabName = this.tabs[0].name;
    }
    this.tableMapping = {
      [tabName]: baseTableMapping,
    };
    return (await super.fetch()) as Promise<FallbackTransformed>;
  }

  static matchesVersion(tabs: GSheetTab[]): boolean {
    // Match all possible sheets because this is the last attempt
    return true;
  }

  transform(
    data: ParsedWorkbook<typeof this.tableMapping>,
  ): FallbackTransformed {
    const communities: FallbackTransformed = {};

    for (const row of data.codes) {
      communities[row.communityName] ??= {
        name: row.communityName,
        date: parseDate(row.date),
        codes: row.codes.split(/[,\s]+/),
      };
    }

    return communities;
  }
}
