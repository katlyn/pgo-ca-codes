import { V1 } from "./V1";
import { V2 } from "./V2";
import { Fallback } from "./Fallback";

export enum AllowedVersions {
  Fallback = "Fallback",
  V1 = "V1",
  V2 = "V2",
}

export const versions = { Fallback, V1, V2 } as const;
export const orderedVersions = [V2, V1, Fallback];
