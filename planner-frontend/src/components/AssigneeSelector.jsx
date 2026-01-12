// components/AssigneeSelector.jsx
const AssigneeSelector = ({ 
    type, // "INDIVIDUAL" or "GROUP"
    selectedValue, 
    onChange,
    groups = [], // Available groups
    users = [], // Available users
    label = "Assign To",
    required = true,
    error = false
  }) => {
    const renderSelect = () => {
      if (type === "INDIVIDUAL") {
        return (
          <select
            value={selectedValue}
            onChange={onChange}
            className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={required}
          >
            <option value="">Select a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        );
      } else {
        return (
          <select
            value={selectedValue}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required={required}
          >
            <option value="">Select a group...</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        );
      }
    };
  
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {renderSelect()}
        {error && type === "INDIVIDUAL" && !selectedValue && (
          <p className="text-red-500 text-xs mt-1">Please select a user to assign this task to</p>
        )}
      </div>
    );
  };
  
  export default AssigneeSelector;