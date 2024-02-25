import Transformer from "./Transformer";
import { GSheetTab, ParsedSheet } from "../sheetUtils";
import { AllowedVersions } from "./index";

export interface Community {
  name: string;
  codes: string[];
}

export type V1Transformed = Record<string, Community>;

export class V1 extends Transformer {
  static version = "V1" as AllowedVersions;
  query = "SELECT A,B";
  columnMapping = {
    A: "communityName",
    B: "codes",
  } as const;

  async fetch(): Promise<V1Transformed> {
    return (await super.fetch()) as Promise<V1Transformed>;
  }

  static extractGid(tabs: GSheetTab[]): string | null {
    return tabs.find((t) => t.name === "BUNDLES")?.gid ?? null;
  }

  transform(data: ParsedSheet<typeof this.columnMapping>): V1Transformed {
    const communities: V1Transformed = {};

    for (const row of data) {
      communities[row.communityName] ??= {
        name: row.communityName,
        codes: row.codes.split(/[,\s]+/),
      };
    }

    return communities;
  }
}
