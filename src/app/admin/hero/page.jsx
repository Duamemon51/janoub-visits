"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, X, File, Heading1, Text, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function HeroAdmin() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: null });
  const [editingId, setEditingId] = useState(null);

  // Fetch heroes
  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homepage/hero");
      const data = await res.json();
      setHeroes(data);
    } catch (error) {
      console.error("Failed to fetch heroes:", error);
      toast.error("Failed to fetch heroes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  // Add or update hero
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subtitle || (!editingId && !form.image)) {
      toast.error("Please fill all required fields and provide an image.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) formData.append(key, form[key]);
    });

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/homepage/hero/${editingId}` : "/api/homepage/hero";
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(editingId ? "Hero updated successfully!" : "Hero added successfully!");
        resetForm();
        setShowFormModal(false);
        fetchHeroes();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Failed to save hero:", error);
      toast.error("Failed to save hero.");
    }
  };

  // Edit hero
  const handleEdit = (hero) => {
    setForm({
      title: hero.title,
      subtitle: hero.subtitle,
      image: hero.image, // Preserve existing image URL for preview
    });
    setEditingId(hero._id);
    setShowFormModal(true);
  };

  // Delete hero
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this hero?")) {
      return;
    }
    try {
      const res = await fetch(`/api/homepage/hero/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Hero deleted successfully!");
        fetchHeroes();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to delete hero.");
      }
    } catch (error) {
      console.error("Failed to delete hero:", error);
      toast.error("Failed to delete hero.");
    }
  };

  // Reset form state
  const resetForm = () => {
    setForm({ title: "", subtitle: "", image: null });
    setEditingId(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />

      {/* Form Modal */}
      {showFormModal && (
        <div
          className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={() => setShowFormModal(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {editingId ? "Edit Hero Section" : "Add New Hero Section"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      placeholder="Hero Title"
                      value={form.title}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all"
                      required
                    />
                    <Heading1 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="subtitle"
                      placeholder="Hero Subtitle"
                      value={form.subtitle}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all"
                      required
                    />
                    <Text size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
                  {form.image && (
                    <img
                      src={
                        form.image && form.image.toString() === "[object File]"
                          ? URL.createObjectURL(form.image)
                          : form.image
                      }
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {!form.image && (
                    <div className="text-center text-gray-500">
                      <Plus size={32} className="inline-block mb-2" />
                      <p>Click to add image</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
                >
                  {editingId ? (
                    <>
                      <Edit size={18} className="inline-block mr-2" /> Update Hero
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="inline-block mr-2" /> Add Hero
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
          className="flex items-center bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 transition duration-300 shadow-md mb-8"
        >
          <Plus size={20} className="mr-2" /> Add New Hero
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Hero Sections
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : heroes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <XCircle size={48} className="inline-block mb-4 text-red-400" />
            <p className="text-lg">No hero sections found. Add one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heroes.map((hero) => (
                  <tr
                    key={hero._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hero.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hero.subtitle}
                    </td>
                    <td className="px-6 py-4">
                      {hero.image && (
                        <Image
                          src={hero.image}
                          alt={hero.title}
                          width={100}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(hero)}
                          className="text-purple-600 hover:text-purple-900"
                          aria-label={`Edit ${hero.title}`}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(hero._id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${hero.title}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}