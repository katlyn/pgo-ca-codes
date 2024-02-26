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
  events: CommunityEvent[];
}

export interface CommunityEvent {
  name: string;
  date: Date;
  codes: string[];
}

export type V2Transformed = Record<string, Community>;

export class V2 extends Transformer {
  static version = "V2" as AllowedVersions;
  tableMapping = {
    Codes: {
      name: "codes",
      query: "SELECT A,B,C,D,E",
      mapping: {
        A: "communityName",
        B: "date",
        C: "eventName",
        D: "codeCount",
        E: "codes",
      },
    },
  } as const;

  async fetch(): Promise<V2Transformed> {
    return (await super.fetch()) as Promise<V2Transformed>;
  }

  static matchesVersion(tabs: GSheetTab[]): boolean {
    return tabs.find((t) => t.name === "Codes") !== undefined;
  }

  transform(data: ParsedWorkbook<typeof this.tableMapping>): V2Transformed {
    const communities: V2Transformed = {};

    for (const row of data.codes) {
      communities[row.communityName] ??= {
        name: row.communityName,
        events: [],
      };
      communities[row.communityName].events.push({
        name: row.eventName,
        date: parseDate(row.date),
        codes: row.codes.split(/[,\s]+/),
      });
    }

    return communities;
  }
}
