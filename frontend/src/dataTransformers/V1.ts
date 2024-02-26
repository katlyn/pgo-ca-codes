import Transformer from "./Transformer";
import { GSheetTab, ParsedWorkbook } from "../sheetUtils";
import { AllowedVersions } from "./index";

export interface Community {
  name: string;
  research: string[];
  bundle: string[];
}

export type V1Transformed = Record<string, Community>;

export class V1 extends Transformer {
  static version = "V1" as AllowedVersions;
  tableMapping = {
    "CD CODES": {
      name: "research",
      query: "SELECT A,B",
      mapping: {
        A: "communityName",
        B: "codes",
      },
    },
    BUNDLES: {
      name: "bundles",
      query: "SELECT A,B",
      mapping: {
        A: "communityName",
        B: "codes",
      },
    },
  } as const;

  async fetch(): Promise<V1Transformed> {
    return (await super.fetch()) as Promise<V1Transformed>;
  }

  static matchesVersion(tabs: GSheetTab[]): boolean {
    return ["CD CODES", "BUNDLES"].every((v) => tabs.some((t) => t.name == v));
  }

  transform(data: ParsedWorkbook<typeof this.tableMapping>): V1Transformed {
    const communities: V1Transformed = {};

    // Clear remove headers from research codes table if they

    // Populate all research codes
    for (const row of data.research) {
      // If the row looks like a header, ignore it
      communities[row.communityName] ??= {
        name: row.communityName,
        bundle: [],
        research: row.codes.trim().length > 0 ? row.codes.split(/[,\s]+/) : [],
      };
    }

    // Populate all bundle codes
    for (const row of data.bundles) {
      const community = communities[row.communityName] ?? {
        name: row.communityName,
        bundle: [],
        research: [],
      };
      community.bundle =
        row.codes.trim().length > 0 ? row.codes.split(/[,\s]+/) : [];
      communities[row.communityName] = community;
    }

    return communities;
  }
}
