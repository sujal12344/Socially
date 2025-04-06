import { Task } from "../api/tasks/route";

async function TasksPage() {
  const response = await fetch("http://localhost:3000/api/tasks", {
    cache: "no-store",
  });
  const tasks: Task = await response.json();

  console.log("tasks:", tasks);

  return <div>TasksPage: {tasks.id}</div>;
}
export default TasksPage;
