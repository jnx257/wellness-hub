import { requireUserId } from "@/lib/services/session";
import { getInboundContext, getJournalData } from "./view-model";
import { JournalView } from "./journal-view";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const userId = await requireUserId();
  const { taskId } = await searchParams;
  const parsedTaskId = taskId ? Number(taskId) : undefined;

  const [entries, inboundContext] = await Promise.all([
    getJournalData(userId),
    parsedTaskId ? getInboundContext(userId, parsedTaskId) : Promise.resolve(null),
  ]);

  return <JournalView entries={entries} inboundContext={inboundContext} />;
}
