import { useEffect, useContext } from "react";
import { GroupContext } from "../contexts/GroupContext";
import { useNavigate } from "react-router-dom";

const GroupList = () => {
  const { groups, loadMyGroups } = useContext(GroupContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyGroups();
  }, []);

  return (
    <div>
      <h3>My Groups</h3>

      {groups.length === 0 && <p>No groups yet</p>}

      <ul>
        {groups.map(group => (
          <li
            key={group.id}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
