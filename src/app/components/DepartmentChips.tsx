interface DepartmentChipsProps {
  selected: string;
  onChange: (dept: string) => void;
}

const departments = ["All", "DD News", "AIR", "HQ", "Engineering", "Admin"];

export function DepartmentChips({ selected, onChange }: DepartmentChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {departments.map((dept) => (
        <button
          key={dept}
          onClick={() => onChange(dept)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
            selected === dept
              ? "bg-[#1A3A6B] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {dept}
        </button>
      ))}
    </div>
  );
}
