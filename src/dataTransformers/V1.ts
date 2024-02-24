import Transformer from "../dataTransformers/Transformer";
import { parseDate, ParsedSheet } from "../sheetUtils";

export interface Community {
  name: string;
  codes: string[];
}
export type V1Transformed = Record<string, Community>;

export class V1 extends Transformer {
  query = "SELECT A,B";
  columnMapping = {
    A: "communityName",
    B: "codes",
  } as const;

  async fetch(): Promise<V1Transformed> {
    return (await super.fetch()) as Promise<V1Transformed>;
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
