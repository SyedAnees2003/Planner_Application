import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { GroupProvider } from "./contexts/GroupContext";
import { TaskProvider } from "./contexts/TaskContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <GroupProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </GroupProvider>
  </AuthProvider>
);
