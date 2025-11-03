export default function Memory({ memory, onClick, onDelete }) {
  return (
    <div
      className="relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete"
      >
        ✕
      </button>
      <img
        src={memory.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
        alt={memory.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-800">{memory.title}</h2>
        <p className="text-sm text-gray-500">{memory.date}</p>
      </div>
    </div>
  );
}
