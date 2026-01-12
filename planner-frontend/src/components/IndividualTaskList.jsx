import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";
import IndividualTaskItem from "./IndividualTaskItem";

const IndividualTaskList = () => {
  const { individualTasks } = useContext(TaskContext);

  if (individualTasks.length === 0) {
    return <p>No individual tasks</p>;
  }

  return (
    <ul>
      {individualTasks.map((task) => (
        <IndividualTaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
};

export default IndividualTaskList;
