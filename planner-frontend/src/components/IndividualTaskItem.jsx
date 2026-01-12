import { useState, useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const IndividualTaskItem = ({ task }) => {
  const { updateIndividualTask, updateIndividualTaskStatus, users } = useContext(TaskContext);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || ""); // Added
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );

  // Get assigned user name
  const getAssignedUserName = () => {
    if (!task.assignedUserId) return "Unassigned";
    const user = users.find(u => u.id === task.assignedUserId);
    return user ? user.name || user.email : "Unknown User";
  };

  const handleSave = async () => {
    await updateIndividualTask(task.id, {
      title,
      description, // Include description
      priority,
      dueDate: dueDate || null
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-3">
      {isEditing ? (
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="2"
          />

          <select
            className="w-full border rounded px-3 py-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="bg-teal-600 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="border px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              )}
              
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Assigned to:</span> {getAssignedUserName()}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Priority:</span> 
                  <span className={`ml-2 px-2 py-0.5 rounded-full ${
                    task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-teal-100 text-teal-800'
                  }`}>
                    {task.priority}
                  </span>
                </p>
                {task.dueDate && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Due:</span> {task.dueDate.split("T")[0]}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.status === 'COMPLETED' ? 'bg-teal-100 text-teal-800' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded"
                >
                  Edit
                </button>

                {task.status !== "COMPLETED" && (
                  <button
                    onClick={() => updateIndividualTaskStatus(task.id, "COMPLETED")}
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualTaskItem;