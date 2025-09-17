"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminEatsPage() {
  const [eats, setEats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    images: ["", "", "", ""],
    categoryId: "",
    placeId: "",
    description: "",
    location: "",
    hours: "",
    price: "",
    totalSeats: "",
    perPersonLimit: "",
  });

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  // --- Data Fetching Functions ---
  const fetchEats = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/eats?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setEats(data.eats);
        setTotalItems(data.totalItems);
      } else {
        toast.error(data.error || "Failed to fetch eats data.");
        setEats([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch eats error:", err);
      toast.error("Network error while fetching eats.");
      setEats([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [catRes, placeRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/places"),
      ]);
      const categoriesData = await catRes.json();
      const placesData = await placeRes.json();
      setCategories(categoriesData);
      setPlaces(placesData);
    } catch (err) {
      console.error("Fetch refs error:", err);
      toast.error("Failed to load categories or places.");
    }
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  // Effect to re-fetch data when currentPage changes
  useEffect(() => {
    fetchEats();
  }, [currentPage]);

  // --- Form and Action Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const newImages = [...form.images];
    newImages[index] = file;
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.categoryId ||
      !form.price ||
      (editing ? false : !form.images.every((img) => img instanceof File))
    ) {
      toast.error("Please fill all required fields and provide images.");
      return;
    }
    
    // Yahan availableSeats ko calculate karne ki zaroorat nahi hai.
    // Server-side logic will handle totalSeats and bookedSeats.
    // For a new entry, bookedSeats will be 0 by default.

    try {
      const formData = new FormData();
      if (form.id) formData.append("id", form.id);
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("location", form.location);
      formData.append("hours", form.hours);
      formData.append("categoryId", form.categoryId);
      formData.append("placeId", form.placeId);
      formData.append("description", form.description);
      formData.append("totalSeats", form.totalSeats);
      formData.append("perPersonLimit", form.perPersonLimit);

      form.images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img);
        }
      });

      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/admin/eats", { method, body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(editing ? "Item updated!" : "Item added!");
        fetchEats();
        resetForm();
        setShowFormModal(false);
      } else {
        toast.error(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submit error: Network or server issue.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item._id,
      name: item.name,
      images: item.images || ["", "", "", ""],
      categoryId: item.categoryId?._id || "",
      placeId: item.placeId?._id || "",
      description: item.description,
      location: item.location,
      hours: item.hours,
      price: item.price,
      totalSeats: item.totalSeats || "",
      perPersonLimit: item.perPersonLimit || "",
    });

    setEditing(true);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch("/api/admin/eats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Item deleted!");
        fetchEats();
      } else {
        toast.error(data.error || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error while deleting.");
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      images: ["", "", "", ""],
      categoryId: "",
      placeId: "",
      description: "",
      location: "",
      hours: "",
      price: "",
      totalSeats: "",
      perPersonLimit: "",
    });
    setEditing(false);
  };

  // --- Pagination Handlers ---
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />
      {/* Modal Overlay with Blur and Opacity */}
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
              {editing ? "Edit Janoub Eats Item" : "Add New Janoub Eats Item"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    placeholder="Item Name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    name="price"
                    placeholder="Price"
                    type="number"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    name="hours"
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                    value={form.hours}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place (Optional)
                  </label>
                  <select
                    name="placeId"
                    value={form.placeId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                  >
                    <option value="">Select Place</option>
                    {places.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="A brief description of the item..."
                  value={form.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Seats
                  </label>
                  <input
                    name="totalSeats"
                    type="number"
                    placeholder="Total Seats"
                    value={form.totalSeats}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Person Limit
                  </label>
                  <input
                    name="perPersonLimit"
                    type="number"
                    placeholder="Per Person Limit"
                    value={form.perPersonLimit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.images.map((img, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image {i + 1}
                    </label>
                    <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
                      {img && (
                        <img
                          src={
                            img instanceof File ? URL.createObjectURL(img) : img
                          }
                          alt={`Preview ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, i)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {!img && (
                        <ImageIcon size={32} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
                >
                  {editing ? (
                    <>
                      <Edit size={18} className="inline-block mr-2" /> Update
                      Item
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="inline-block mr-2" /> Add Item
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
          onClick={handleCreate}
          className="flex items-center bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 transition duration-300 shadow-md mb-8"
        >
          <Plus size={20} className="mr-2" /> New Item
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Janoub Eats Items
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : eats.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <XCircle size={48} className="inline-block mb-4 text-red-400" />
            <p className="text-lg">No eats items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Per Person Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eats.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.categoryId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Here is the updated logic for available seats */}
                      {(item.totalSeats - (item.bookedSeats || 0))} / {item.totalSeats || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.perPersonLimit || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-purple-600 hover:text-purple-900"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center text-sm font-medium text-gray-700">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}