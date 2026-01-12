import { useState, useContext } from "react";
import { GroupContext } from "../contexts/GroupContext";

const CreateGroup = () => {
  const { createGroup } = useContext(GroupContext);
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createGroup(name);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create Group</button>
    </form>
  );
};

export default CreateGroup;
