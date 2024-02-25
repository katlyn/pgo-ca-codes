import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { BadRequestError } from "http-errors-enhanced";

const routes: FastifyPluginAsyncTypebox = async function (
  fastify,
): Promise<void> {
  fastify.get("/healthcheck", {}, async () => {
    return { health: "OK" };
  });

  const snapshotRegex = /topsnapshot":(.+),"revision"/;
  fastify.get(
    "/sheetTabs",
    {
      schema: {
        querystring: Type.Object({ key: Type.String() }),
        response: {
          "200": Type.Array(
            Type.Object({ name: Type.String(), gid: Type.String() }),
          ),
        },
      },
    },
    async (request) => {
      const htmlViewURL = new URL(
        `https://docs.google.com/spreadsheets/d/${request.query.key}/edit`,
      );
      const response = await fetch(htmlViewURL, { redirect: "manual" });

      if (response.status !== 200) {
        throw new BadRequestError(`Fetching sheet not OK: ${response.status}`);
      }

      // Extract the "topsnapshot" array, so we can pull tab names and GIDs
      const doc = await response.text();
      const bootstrapSnapshot = doc.match(snapshotRegex);
      if (bootstrapSnapshot === null) {
        throw new Error("Unable to extract bootstrap topsnapshot!");
      }

      // Extract the tab data from the snapshot - there's no documentation about
      // what format this is, so this somewhat brute forces it. With luck, it won't
      // break any time soon.
      const snapshot: [number, string][] = JSON.parse(bootstrapSnapshot[1]);
      const tabSnapshotData = snapshot
        .map(([_, str]) => {
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        })
        .filter(
          (v) =>
            v !== null &&
            Array.isArray(v) &&
            v[1] === 0 &&
            v?.[3]?.[0]?.[1]?.[0]?.[2] !== undefined,
        );

      // If these indexes seem insane it's because I went insane figuring them out
      return tabSnapshotData.map((v) => ({
        name: v[3][0][1][0][2].toString() as string,
        gid: v[2].toString() as string,
      }));
    },
  );
};

export default routes;
