"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Plus, X, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    placeId: "",
    img: null, // File object for new image
    totalSeats: 0,
    perPersonLimit: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [currentImgUrl, setCurrentImgUrl] = useState(null); // URL for displaying the current image

  useEffect(() => {
    fetchTours();
    fetchPlaces();
  }, []);

  // Fetch all tours and calculate available seats
  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tours");
      const data = await res.json();

      // Add availableSeats property
      const toursWithAvailableSeats = data.map((tour) => ({
        ...tour,
        availableSeats: (tour.totalSeats || 0) - (tour.bookedSeats || 0),
      }));

      setTours(toursWithAvailableSeats);
    } catch (err) {
      console.error("Fetch tours error:", err);
      toast.error("Failed to fetch tours.");
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all places
  const fetchPlaces = async () => {
    try {
      const res = await fetch("/api/admin/places");
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      console.error("Fetch places error:", err);
      toast.error("Failed to fetch places.");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? parseInt(value, 10) : value,
    });
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, img: file });
      setCurrentImgUrl(URL.createObjectURL(file));
    }
  };

  // Handle add/update form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !form.title ||
      !form.price ||
      !form.placeId ||
      (!editingId && !form.img) ||
      form.totalSeats <= 0 ||
      form.perPersonLimit <= 0
    ) {
      toast.error("Please fill all required fields correctly.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "img" && typeof form[key] === "string") return;
      formData.append(key, form[key]);
    });

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/tours?id=${editingId}` : "/api/admin/tours";
      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        toast.success(editingId ? "Tour updated successfully!" : "Tour added successfully!");
        resetForm();
        setShowFormModal(false);
        fetchTours();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || `Failed to ${editingId ? "update" : "add"} tour.`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit tour
  const handleEdit = (tour) => {
    setForm({
      title: tour.title,
      price: tour.price,
      placeId: tour.placeId?._id || "",
      img: tour.img,
      totalSeats: tour.totalSeats,
      perPersonLimit: tour.perPersonLimit,
    });
    setEditingId(tour._id);
    setCurrentImgUrl(tour.img);
    setShowFormModal(true);
  };

  // Delete tour
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    try {
      const res = await fetch(`/api/admin/tours?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tour deleted successfully!");
        fetchTours();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to delete tour.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete error.");
    }
  };

  // Reset form state
  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      placeId: "",
      img: null,
      totalSeats: 0,
      perPersonLimit: 1,
    });
    setEditingId(null);
    setCurrentImgUrl(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />

      {/* Modal Form */}
      {showFormModal && (
        <div
          className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={() => {
            setShowFormModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowFormModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {editingId ? "Edit Guided Tour" : "Add New Guided Tour"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Tour Title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Tour Price"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                  <select
                    name="placeId"
                    value={form.placeId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  >
                    <option value="">Select Place</option>
                    {places.map((place) => (
                      <option key={place._id} value={place._id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
                  <input
                    type="number"
                    name="totalSeats"
                    placeholder="Total Seats"
                    value={form.totalSeats}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per-Person Limit</label>
                  <input
                    type="number"
                    name="perPersonLimit"
                    placeholder="Per-Person Limit"
                    value={form.perPersonLimit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    min="1"
                    required
                  />
                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
                  {currentImgUrl && (
                    <img
                      src={currentImgUrl}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    name="img"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {!currentImgUrl && (
                    <div className="text-center text-gray-500">
                      <Plus size={32} className="inline-block mb-2" />
                      <p>Click to add image</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Form Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center text-white font-semibold py-3 rounded-md transition duration-300 shadow-md ${
                    isSubmitting ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isSubmitting
                    ? "Processing..."
                    : editingId
                    ? <><Edit size={18} className="mr-2" /> Update Tour</>
                    : <><Plus size={18} className="mr-2" /> Add Tour</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
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
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="flex items-center bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 transition duration-300 shadow-md mb-8"
        >
          <Plus size={20} className="mr-2" /> Add New Tour
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Guided Tours</h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <XCircle size={48} className="inline-block mb-4 text-red-400" />
            <p className="text-lg">No tours found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tour.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tour.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tour.placeId?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.availableSeats}/{tour.totalSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(tour)} className="text-purple-600 hover:text-purple-900" aria-label={`Edit ${tour.title}`}><Edit size={20} /></button>
                        <button onClick={() => handleDelete(tour._id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${tour.title}`}><Trash2 size={20} /></button>
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
