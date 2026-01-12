import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";

const GroupTaskList = () => {
  const { groupTasks, participateTask, finalizeTask } =
    useContext(TaskContext);
  const { isAdmin, activeGroup } = useContext(GroupContext);

  if (groupTasks.length === 0) {
    return <p>No tasks yet</p>;
  }

  return (
    <ul>
      {groupTasks.map((task) => (
        <li key={task.id}>
          {task.title} — {task.status}

          {!isAdmin && task.status !== "COMPLETED" && (
            <button
              onClick={() =>
                participateTask(task.id, activeGroup.id)
              }
            >
              Mark Complete
            </button>
          )}

          {isAdmin && task.status !== "COMPLETED" && (
            <button
              onClick={() =>
                finalizeTask(task.id, activeGroup.id)
              }
              style={{ marginLeft: "10px" }}
            >
              Finalize
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default GroupTaskList;
