import { useState, useEffect } from "react";
import Memory from "../components/Memory";

export default function Food() {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem("memories");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [editingMemoryIndex, setEditingMemoryIndex] = useState(null);

  // Formulario
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState([]);

  const [error, setError] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem("memories", JSON.stringify(memories));
  }, [memories]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Files = await Promise.all(files.map(toBase64));
    setImages(base64Files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || images.length === 0) {
      setError("Fill in all required fields.");
      return;
    }
    setError("");

    const newMemory = { images, title, date, note, cuisine, rating };

    if (editingMemoryIndex !== null) {
      // Editar
      setMemories((prev) => {
        const copy = [...prev];
        copy[editingMemoryIndex] = newMemory;
        return copy;
      });
    } else {
      // Crear nueva
      setMemories((prev) => [newMemory, ...prev]);
    }

    // Limpiar form
    setTitle("");
    setDate("");
    setNote("");
    setCuisine("");
    setRating(0);
    setImages([]);
    setEditingMemoryIndex(null);
  };

  const handleEdit = (memory, index) => {
    setTitle(memory.title);
    setDate(memory.date);
    setNote(memory.note || "");
    setCuisine(memory.cuisine || "");
    setRating(memory.rating || 0);
    setImages(memory.images);
    setEditingMemoryIndex(index);
  };

  const handlePrevImage = () => {
    setCarouselIndex((prev) => (prev === 0 ? selectedMemory.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCarouselIndex((prev) => (prev === selectedMemory.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-6 text-center text-white">
      <div className="grid grid-cols-[3fr_6fr_3fr] gap-4 justify-center">
        <div className="text-left">Filters</div>

        {/* CENTER */}
        <div>
          <h1 className="text-2xl">Food Gallery</h1>

          {memories.length === 0 && (
            <p className="mt-6 text-gray-300 italic">No memories yet </p>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6">
            {memories.map((memory, index) => (
              <Memory
                key={index}
                memory={memory}
                onClick={() => setSelectedMemory(memory)}
                onDelete={() =>
                  setMemories((prev) => {
                    const newArr = [...prev];
                    newArr.splice(index, 1);
                    return newArr;
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR - FORM */}
        <div className="bg-black/20 rounded-xl p-4">
          <h1 className="text-2xl">{editingMemoryIndex !== null ? "Edit memory" : "Add memory"}</h1>
          <div className="mt-6">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-400 font-medium text-left">{error}</p>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              {/* TITLE */}
              <div className="flex items-center gap-4 w-full">
                <label className="text-right text-gray-700 font-medium w-1/3">
                  Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write something..."
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-2/3 ml-auto"
                />
              </div>

              {/* DATE */}
              <div className="flex items-center gap-4 w-full">
                <label className="text-right text-gray-700 font-medium w-1/3">
                  Date:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-2/3 ml-auto"
                />
              </div>

              {/* CUISINE */}
              <div className="flex items-center gap-4 w-full">
                <label className="text-right text-gray-700 font-medium w-1/3">
                  Cuisine:
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-2/3 ml-auto"
                >
                  <option value="">Select one...</option>
                  <option value="chinese">Chinese</option>
                  <option value="spanish">Spanish</option>
                  <option value="italian">Italian</option>
                </select>
              </div>

              {/* NOTE */}
              <div className="flex items-center gap-4 w-full">
                <label className="text-right text-gray-700 font-medium w-1/3">
                  Note:
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write something..."
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-2/3 ml-auto"
                />
              </div>

              {/* RATING */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium text-right w-1/3">
                  Rating:
                </span>
                <div className="flex items-center gap-2 w-2/3 ml-auto">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`text-3xl ${
                        value <= rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:text-yellow-500 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 border border-green-500 hover:bg-green-600/30 text-white font-semibold py-2 rounded-lg transition-transform hover:scale-105"
              >
                {editingMemoryIndex !== null ? "Save changes" : "Save"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>

            {/* CARRUSEL */}
            <div className="relative">
              <img
                src={selectedMemory.images[carouselIndex]}
                alt={selectedMemory.title}
                className="w-full h-100 object-cover rounded-md mb-4"
              />
              {selectedMemory.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedMemory.title}
            </h2>
            <p className="text-gray-500 mb-1">Date: {selectedMemory.date}</p>
            {selectedMemory.cuisine && (
              <p className="text-gray-500 mb-1">
                Cuisine: {selectedMemory.cuisine}
              </p>
            )}
            {selectedMemory.note && (
              <p className="text-gray-500 mb-1">Note: {selectedMemory.note}</p>
            )}
            <p className="text-yellow-500 text-lg">
              Rating: {"★".repeat(selectedMemory.rating)}
            </p>
            <button
              onClick={() => {
                const index = memories.findIndex(
                  (m) => m === selectedMemory
                );
                handleEdit(selectedMemory, index);
                setSelectedMemory(null);
              }}
              className="mt-2 border border-blue-500 hover:bg-blue-500/20 text-blue-500 font-semibold py-1 px-3 rounded-lg"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
