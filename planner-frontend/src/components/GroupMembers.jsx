import { useContext } from "react";
import { GroupContext } from "../contexts/GroupContext";

const GroupMembers = () => {
  const { members, activeGroup } = useContext(GroupContext);

  if (!activeGroup) return null;

  return (
    <div className="w-72 bg-white border-l p-4 hidden lg:block">
      <h3 className="font-semibold mb-3">
        {activeGroup.name} Members
      </h3>

      <ul className="space-y-3">
        {members.map(m => (
          <li key={m.id} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
              {m.name[0]}
            </div>
            <span className="text-sm">{m.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupMembers;