import { getTodoData } from "./view-model";
import { TodoView } from "./todo-view";
import { requireUserId } from "@/lib/services/session";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const userId = await requireUserId();
  const data = await getTodoData(userId);
  return <TodoView {...data} />;
}
