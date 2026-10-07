import { getTodoData } from "./view-model";
import { TodoView } from "./todo-view";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const data = await getTodoData();
  return <TodoView {...data} />;
}
