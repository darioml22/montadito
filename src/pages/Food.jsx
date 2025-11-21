import { useState, useEffect, useRef } from "react";
import Memory from "../components/Memory";
import * as imageStore from "../utils/imageStore";

const cuisineToCountry = {
  italian: "IT",
  spanish: "ES",
  french: "FR",
  japanese: "JP",
  danish: "DK",
  american: "US",
  chinese: "CN",
  indian: "IN",
  mexican: "MX",
  thai: "TH",
  greek: "GR",
  turkish: "TR",
  palestinian: "PS",
  vietnamese: "VN",
  korean: "KR",
  german: "DE",
  other: "",
};

export default function Food() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [editingMemoryIndex, setEditingMemoryIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    cuisine: "",
    countryCode: "",
    note: "",
    images: [],
    rating: 0,
  });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const prefetchedKeysRef = useRef(new Set());
  const currentDisplayedKeyRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentMemories = memories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(memories.length / itemsPerPage);

  // === Load memories from backend ===
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await fetch("http://localhost:3000/memories");
        if (!res.ok) return;
        const data = await res.json();
        setMemories(prev => prev.length ? prev : data);
      } catch (err) {
        console.error("Error fetching memories:", err);
      }
    };
    fetchMemories();
  }, []);

  // === Save updated memories to backend ===
  const saveToServer = async (updated) => {
    try {
      const res = await fetch("https://montadito2.onrender.com/", { //http://localhost:3000/memories --> Local
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to save data");
    } catch (err) {
      console.error("Error saving to backend:", err);
    }
  };

  // === Image handling ===
  const toBase64 = (file, maxWidth = 800, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, quality);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = url;
    });

  const [imageLoading, setImageLoading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageLoading(true);
    const newImages = [];

    try {
      for (const f of files) {
        const thumb = await toBase64(f);
        const key = await imageStore.putImage(f);
        newImages.push({ type: "idb", key, thumb });
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    } finally {
      setImageLoading(false);
      e.target.value = "";
    }
  };

  // === Form submission ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.cuisine) {
      alert("Please fill the required fields.");
      return;
    }

    const cuisineKey = formData.cuisine.trim().toLowerCase();
    const payload = {
      ...formData,
      cuisine: cuisineKey,
      countryCode: cuisineToCountry[cuisineKey] || "",
    };

    let updated;
    if (editingMemoryIndex !== null) {
      updated = memories.map((m, i) =>
        i === editingMemoryIndex ? { ...m, ...payload } : m
      );
      setEditingMemoryIndex(null);
    } else {
      updated = [{ id: Date.now(), ...payload }, ...memories];
    }

    setMemories(updated);
    saveToServer(updated);

    setFormData({
      title: "",
      date: "",
      cuisine: "",
      countryCode: "",
      note: "",
      images: [],
      rating: 0,
    });
  };

  const handleEdit = (memory, index) => {
    setFormData(memory);
    setEditingMemoryIndex(index);
  };

  const handleDelete = (index) => {
    const updated = memories.filter((_, i) => i !== index);
    setMemories(updated);
    saveToServer(updated);
    setSelectedMemory(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#658C58] to-[#F7F2D7] text-gray-900">
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <header className="flex justify-between items-center mb-8 px-4">
          <div className="flex flex-col text-center mx-auto">
            <h1 className="text-3xl font-extrabold">Food memories</h1>
            <div className="text-sm text-gray-600 mt-1">Nikoline I love you!</div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <main className="col-span-12 md:col-span-8 bg-white/70 rounded-xl p-6 shadow">
            {memories.length === 0 ? (
              <div className="py-12 text-center text-gray-600">
                No memories yet — add one below.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                {currentMemories.map((memory, index) => (
                  <Memory
                    key={memory.id ?? index}
                    memory={memory}
                    onClick={() => {
                      setSelectedMemory({ ...memory, __index: index });
                      setCarouselIndex(0);
                    }}
                    onDelete={() => handleDelete(index)}
                    onEdit={() => handleEdit(memory, index)}
                  />
                ))}
              </div>
            )}
            {selectedMemory && (  
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-lg w-[90%] sm:w-full relative">
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
                  >
                    ✕
                  </button>

                  {selectedMemory.images?.length > 0 ? (
                    <>
                      <img
                        src={selectedMemory.images[carouselIndex]?.thumb}
                        alt=""
                        className="w-full h-auto rounded mb-4"
                      />

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() =>
                            setCarouselIndex((i) =>
                              i === 0
                                ? selectedMemory.images.length - 1
                                : i - 1
                            )
                          }
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          ←
                        </button>

                        <span className="text-gray-600">
                          {carouselIndex + 1} / {selectedMemory.images.length}
                        </span>

                        <button
                          onClick={() =>
                            setCarouselIndex((i) =>
                              i === selectedMemory.images.length - 1
                                ? 0
                                : i + 1
                            )
                          }
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          →
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500">No images available.</p>
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 gap-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      Previous
                    </button>

                    <span className="text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
          </main>

          <aside className="col-span-12 md:col-span-4">
            <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editingMemoryIndex !== null ? "Edit memory" : "Add memory"}
              </h2>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white cursor-pointer w-full"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, date: e.target.value }))
                  }
                  className="border rounded px-3 py-2 w-full"
                />
                <select
                  value={formData.cuisine}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      cuisine: v,
                      countryCode:
                        cuisineToCountry[v.toLowerCase()] || "",
                    }));
                  }}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select cuisine</option>
                  {Object.keys(cuisineToCountry).map((c) => (
                    <option key={c} value={c}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, note: e.target.value }))
                  }
                  className="border rounded px-3 py-2 h-20 resize-none"
                />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, rating: n }))
                      }
                      className={`text-2xl ${
                        n <= formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded px-4 py-2 mt-2"
                >
                  {editingMemoryIndex !== null ? "Save" : "Add"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
