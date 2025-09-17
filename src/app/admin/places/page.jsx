'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Image as ImageIcon,
  Type,
  FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ExploreAdmin() {
  const [places, setPlaces] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all places
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/places");
      if (!res.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await res.json();
      setPlaces(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("tagline", tagline);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/places/${editingId}` : "/api/admin/places";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(editingId ? "Place updated successfully!" : "Place added successfully!");
        closeModal();
        fetchPlaces();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Something went wrong!"}`);
      }
    } catch (error) {
      toast.error("Failed to submit form. Please check your network.");
    }
  };

  // Edit
  const handleEdit = (place) => {
    setName(place.name);
    setTagline(place.tagline || "");
    setDescription(place.description || "");
    setImage(null);
    setEditingId(place._id);
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this place?")) return;
    try {
      const res = await fetch(`/api/admin/places/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Place deleted!");
        fetchPlaces();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Failed to delete!"}`);
      }
    } catch (error) {
      toast.error("Failed to delete place.");
    }
  };

  const openModal = () => {
    setEditingId(null);
    setName("");
    setTagline("");
    setDescription("");
    setImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setTagline("");
    setDescription("");
    setImage(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white shadow-xl rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Explore Places
          </h1>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
          >
            <Plus size={18} />
            Add New Place
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr className="text-left text-gray-600">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Tagline</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {places.length > 0 ? (
                  places.map((place) => (
                    <tr
                      key={place._id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                          {place.image ? (
                            <Image
                              src={place.image}
                              alt={place.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-800 font-medium">{place.name}</td>
                      <td className="p-4 text-gray-600">{place.tagline || "-"}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(place)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            title="Edit Place"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(place._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Place"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No explore places found. Add a new one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform scale-95 animate-scaleUp">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? "Edit Place" : "Add New Place"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Place Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Downtown Market"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    required
                  />
                  <MapPin
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              {/* Tagline */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Tagline
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Short tagline..."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <Type
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Long description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  ></textarea>
                  <FileText
                    size={20}
                    className="absolute left-3 top-4 text-gray-400"
                  />
                </div>
              </div>
              {/* Image */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Place Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <ImageIcon
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                >
                  {editingId ? "Update Place" : "Add Place"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
