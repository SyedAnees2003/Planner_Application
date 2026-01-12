import { useNavigate } from "react-router-dom";

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const memberCount = group.Users ? group.Users.length : 0;

  const isAdmin = group.Users?.some(
    u => u.GroupMember?.isAdmin
  );

  const createdAt = new Date(group.createdAt).toLocaleDateString();

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mb-4">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>

      <h3 className="font-bold text-lg text-slate-800 mb-4">{group.name}</h3>

            {/* Description */}
            {group.description && (
        <p className="text-sm text-slate-500 mb-2 line-clamp-2">
          {group.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isAdmin
              ? "bg-teal-100 text-teal-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isAdmin ? "Admin" : "Member"}
        </span>

        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;