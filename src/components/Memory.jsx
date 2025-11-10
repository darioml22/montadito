import React, { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";

export default function Memory({ memory, onClick, onDelete, onEdit }) {
  const countryCode =
    typeof memory?.countryCode === "string"
      ? memory.countryCode.trim().slice(0, 2).toUpperCase()
      : undefined;

  const placeholder = "https://via.placeholder.com/400x260?text=No+Image";
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [imageError, setImageError] = useState(false);

  // Cargar la imagen de manera más robusta
  useEffect(() => {
    const img = memory?.images?.[0];

    if (!img) {
      setImgSrc(placeholder);
      setIsLoading(false);
      return;
    }

    if (typeof img === "string") {
      setImgSrc(img);
    } else if (img?.thumb) {
      setImgSrc(img.thumb);
    } else {
      setImgSrc(placeholder);
    }

    setIsLoading(true);
  }, [memory?.images]);

  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.warn("Error loading image for memory:", memory?.title);
    setImageError(true);
    setIsLoading(false);
    setImgSrc(placeholder);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick && onClick();
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit && onEdit();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete && onDelete();
  };

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
    >
      <img
        src={imgSrc}
        alt={memory?.title || "Food memory"}
        loading="lazy"
        className={`w-full h-64 object-cover transition-opacity duration-300 ${
          imageError ? 'opacity-70' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />

      {/* Mostrar indicador de carga si la imagen está cargando */}
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      )}

      {/* edit button top-left */}
      <button
        onClick={handleEdit}
        className="absolute top-3 left-3 z-20 bg-white/90 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        aria-label="Edit memory"
        title="Edit"
      >
        ✎
      </button>

      {/* delete button top-right */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 z-20 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
        aria-label="Delete memory"
        title="Delete"
      >
        ✕
      </button>

      <div className="absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/65 to-transparent text-white text-center">
        <div className="font-semibold text-sm">{memory?.title || "Untitled"}</div>
        <div className="text-xs opacity-90 flex items-center justify-center gap-2 mt-1">
          {countryCode && (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: 18, height: 12 }}
              aria-label={countryCode}
            />
          )}
          <span className="capitalize">{memory?.cuisine || "Unknown cuisine"}</span>
        </div>
      </div>
    </div>
  );
}