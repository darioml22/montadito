import React from "react";
import ReactCountryFlag from "react-country-flag";

export default function Memory({ memory, onClick, onDelete, onEdit }) {
  const countryCode =
    typeof memory?.countryCode === "string"
      ? memory.countryCode.trim().slice(0, 2).toUpperCase()
      : undefined;

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <img
        src={memory.images?.[0] || "https://via.placeholder.com/400x260?text=No+Image"}
        alt={memory.title}
        className="w-full h-64 object-cover"
      />

      {/* edit button top-left */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit && onEdit();
        }}
        className="absolute top-3 left-3 z-20 bg-white/90 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white"
        aria-label="Edit memory"
        title="Edit"
      >
        ✎
      </button>

      {/* delete button top-right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        className="absolute top-3 right-3 z-20 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
        aria-label="Delete memory"
        title="Delete"
      >
        ✕
      </button>

      {/* centered title + cuisine overlay */}
      <div className="absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/65 to-transparent text-white text-center">
        <div className="font-semibold text-sm">{memory.title}</div>
        <div className="text-xs opacity-90 flex items-center justify-center gap-2 mt-1">
          {countryCode && (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: 18, height: 12 }}
              aria-label={countryCode}
            />
          )}
          <span className="capitalize">{memory.cuisine}</span>
        </div>
      </div>
    </div>
  );
}