import { connectDB } from "../src/lib/db/mongodb";
import { fetchExercisePage } from "../src/lib/exercisedb/client";
import { mapExerciseDbItem } from "../src/lib/exercises/map";
import { ExerciseModel } from "../src/models/Exercise";

async function main() {
  const maxPages = Number(process.env.SYNC_MAX_PAGES || 0);
  await connectDB();

  let after: string | undefined;
  let page = 0;
  let upserted = 0;
  let skipped = 0;

  while (true) {
    page += 1;
    const result = await fetchExercisePage({ after, limit: 25 });
    if (result.items.length === 0) break;

    for (const raw of result.items) {
      const mapped = mapExerciseDbItem(raw);
      if (!mapped) {
        skipped += 1;
        continue;
      }
      await ExerciseModel.findOneAndUpdate(
        { exerciseId: mapped.exerciseId },
        mapped,
        { upsert: true, returnDocument: "after" }
      );
      upserted += 1;
    }

    console.log(
      `[sync-exercises] page ${page} (+${result.items.length}) total upserted=${upserted} skipped=${skipped}`
    );

    if (!result.hasNextPage || !result.nextCursor) break;
    if (maxPages > 0 && page >= maxPages) break;
    after = result.nextCursor;
  }

  const count = await ExerciseModel.countDocuments();
  console.log(`[sync-exercises] done. collection size=${count}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("[sync-exercises] failed", error);
  process.exit(1);
});
