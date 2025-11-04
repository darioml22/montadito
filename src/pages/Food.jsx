import { useState, useEffect } from "react";
import Memory from "../components/Memory";

const cuisineToCountry = {
  italian: "IT",
  spanish: "ES",
  french: "FR",
  japanese: "JP",
  danish: "DK",
  american: "US",
  chinese: "CN",
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

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      let publicList = [];
      try {
        const res = await fetch("/memories.json", { cache: "no-store" });
        if (res.ok) publicList = await res.json();
      } catch (e) {}

      const local = JSON.parse(localStorage.getItem("memories") || "[]");

      const normalize = (m) => {
        const cuisine = (m.cuisine || "").toString().trim().toLowerCase();
        return { ...m, cuisine, countryCode: m.countryCode || cuisineToCountry[cuisine] || "" };
      };

      const publicNorm = publicList.map(normalize);
      const localNorm = local.map(normalize);
      const merged = [
        ...publicNorm,
        ...localNorm.filter((l) => !publicNorm.some((p) => p.id === l.id)),
      ];

      if (mounted) setMemories(merged);
    };
    load();
    return () => (mounted = false);
  }, []);

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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const base64Files = await Promise.all(files.map(toBase64));
    setFormData((prev) => ({ ...prev, images: base64Files }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.cuisine) {
      alert("Please fill the required fields.");
      return;
    }

    const cuisineKey = formData.cuisine.toString().trim().toLowerCase();
    const payload = {
      ...formData,
      cuisine: cuisineKey,
      countryCode: cuisineToCountry[cuisineKey] || "",
    };

    if (editingMemoryIndex !== null && memories[editingMemoryIndex]) {
      setMemories((prev) => {
        const copy = [...prev];
        copy[editingMemoryIndex] = { ...copy[editingMemoryIndex], ...payload };
        return copy;
      });
      setEditingMemoryIndex(null);
    } else {
      const newMemory = { id: Date.now(), ...payload };
      setMemories((prev) => [newMemory, ...prev]);
    }

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
    setFormData({
      title: memory.title || "",
      date: memory.date || "",
      cuisine: memory.cuisine || "",
      countryCode: memory.countryCode || "",
      note: memory.note || "",
      images: memory.images || [],
      rating: memory.rating || 0,
    });
    setEditingMemoryIndex(index);
    const formTop = document.querySelector("aside.col-span-3");
    if (formTop) formTop.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = (index) => {
    setMemories((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setSelectedMemory(null);
  };

  const handlePrevImage = () => {
    if (!selectedMemory?.images?.length) return;
    setCarouselIndex((prev) =>
      prev === 0 ? selectedMemory.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!selectedMemory?.images?.length) return;
    setCarouselIndex((prev) =>
      prev === selectedMemory.images.length - 1 ? 0 : prev + 1
    );
  };

  const downloadJSON = () => {
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "memories-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#658C58] to-[#F7F2D7] text-gray-900">
      <div className="max-w-6xl mx-auto mt-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold">Food memories</h1>
            <div className="text-sm text-gray-600 mt-1">Add, browse and remember great meals</div>
          </div>
          <div>
            {isLocal ? (
              <span className="text-sm text-green-800">Author mode</span>
            ) : (
              <span className="text-sm text-gray-500">Public gallery</span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-2 bg-white/60 rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-3">Filters</h2>
            <p className="text-sm text-gray-600">(placeholder)</p>
            <div className="mt-4">
              <span className="text-xs text-gray-500">Saved: </span>
              <div className="mt-2 text-sm font-medium">{memories.length}</div>
            </div>

            {/* Export button moved here (less prominent, green to match palette) */}
            {isLocal && (
              <div className="mt-6">
                <button
                  onClick={downloadJSON}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Export JSON
                </button>
                <div className="text-xs text-gray-500 mt-2">Export and run write-memories to publish</div>
              </div>
            )}
          </aside>

          <main className="col-span-7">
            <div className="bg-white/70 rounded-xl p-6 shadow">
              {memories.length === 0 ? (
                <div className="py-12 text-center text-gray-600">No memories yet — add one on the right.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {memories.map((memory, index) => (
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
            </div>
          </main>

          {isLocal && (
            <aside className="col-span-3">
              <div className="bg-white/80 rounded-xl p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">{editingMemoryIndex !== null ? "Edit memory" : "Add memory"}</h2>

                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white cursor-pointer"
                  />

                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />

                  <select
                    value={formData.cuisine}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((p) => ({ ...p, cuisine: v, countryCode: cuisineToCountry[v.toString().toLowerCase()] || "" }));
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
                    onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                    className="border rounded px-3 py-2 h-20 resize-none"
                  />

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, rating: n }))}
                        className={`text-2xl ${n <= formData.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-green-600 text-white rounded px-4 py-2">
                      {editingMemoryIndex !== null ? "Save" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          title: "",
                          date: "",
                          cuisine: "",
                          countryCode: "",
                          note: "",
                          images: [],
                          rating: 0,
                        })
                      }
                      className="flex-1 border rounded px-4 py-2"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          )}
        </div>

        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="relative flex-shrink-0 flex items-center justify-center bg-black/10 p-4">
                <img
                  src={selectedMemory.images?.[carouselIndex] || "https://via.placeholder.com/800x500?text=No+Image"}
                  alt={selectedMemory.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg"
                />

                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70"
                  disabled={!selectedMemory?.images?.length}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70"
                  disabled={!selectedMemory?.images?.length}
                  aria-label="Next image"
                >
                  ›
                </button>

                <button
                  onClick={() => { setSelectedMemory(null); setCarouselIndex(0); }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-auto flex-1 flex flex-col justify-between">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{selectedMemory.title}</h3>
                  <div className="text-sm text-gray-600 capitalize mt-1">{selectedMemory.cuisine}</div>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  <div>Date: {selectedMemory.date}</div>
                  {selectedMemory.note && <div className="mt-2">Note: {selectedMemory.note}</div>}
                  <div className="mt-2">Rating: {"★".repeat(selectedMemory.rating || 0)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}