import { connectDB } from "../src/lib/db/mongodb";
import { fetchExercisePage } from "../src/lib/exercisedb/client";
import { mapExerciseDbItem } from "../src/lib/exercises/map";
import { ExerciseModel } from "../src/models/Exercise";
import { SyncStateModel } from "../src/models/SyncState"; // new, see below

const SYNC_KEY = "exercisedb-sync";
const DELAY_MS = 400;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const maxPages = Number(process.env.SYNC_MAX_PAGES || 0);
  const resume = process.env.SYNC_RESUME !== "false";
  await connectDB();

  const state = resume ? await SyncStateModel.findOne({ key: SYNC_KEY }) : null;
  let after: string | undefined = state?.cursor ?? undefined;
  if (after) console.log(`[sync-exercises] resuming from cursor: ${after}`);

  let page = 0, upserted = 0, skipped = 0;

  while (true) {
    page += 1;
    const result = await fetchExercisePage({ after, limit: 25 });
    if (result.items.length === 0) break;

    for (const raw of result.items) {
      const mapped = mapExerciseDbItem(raw);
      if (!mapped) { skipped += 1; continue; }
      await ExerciseModel.findOneAndUpdate(
        { exerciseId: mapped.exerciseId }, mapped, { upsert: true }
      );
      upserted += 1;
    }

    console.log(`[sync-exercises] page ${page} (+${result.items.length}) total upserted=${upserted} skipped=${skipped}`);

    if (!result.hasNextPage || !result.nextCursor) {
      await SyncStateModel.deleteOne({ key: SYNC_KEY });
      break;
    }

    after = result.nextCursor;
    await SyncStateModel.findOneAndUpdate(
      { key: SYNC_KEY }, { cursor: after, updatedAt: new Date() }, { upsert: true }
    );

    if (maxPages > 0 && page >= maxPages) break;
    await sleep(DELAY_MS);
  }

  const count = await ExerciseModel.countDocuments();
  console.log(`[sync-exercises] done. collection size=${count}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("[sync-exercises] failed", error);
  process.exit(1);
});