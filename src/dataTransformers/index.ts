import { V1 } from "./V1";
import { V2 } from "./V2";

export enum AllowedVersions {
  V1 = "V1",
  V2 = "V2",
}

export const versions = { V1, V2 } as const;
export const orderedVersions = [V2, V1];
