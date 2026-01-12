const GroupProgress = ({ tasks }) => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return <p>No tasks to track progress</p>;
    }
  
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;
  
    const percentage = Math.round((completed / total) * 100);
  
    return (
      <div style={{ marginBottom: "20px" }}>
        <p>
          Progress: <strong>{percentage}%</strong>
          {" "}({completed}/{total} tasks completed)
        </p>
  
        <div
          style={{
            height: "10px",
            width: "100%",
            background: "#ddd",
            borderRadius: "5px"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percentage}%`,
              background: "#4caf50",
              borderRadius: "5px"
            }}
          />
        </div>
      </div>
    );
  };
  
  export default GroupProgress;
  