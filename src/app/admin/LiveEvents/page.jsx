"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, ImageIcon, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Reusable fetcher function with error handling
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch from ${url}`);
  }
  return res.json();
};

export default function LiveEventsAdmin() {
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    dateFrom: "",
    dateTo: "",
    location: "",
    price: "",
    btn: "",
    placeId: "",
    status: "active",
    totalSeats: "",
    perPersonLimit: "",
    img: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, placesData] = await Promise.all([
        fetcher("/api/admin/live-events"),
        fetcher("/api/admin/places"),
      ]);
      setEvents(eventsData);
      setPlaces(placesData);
    } catch (error) {
      toast.error("Failed to load data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      dateFrom: "",
      dateTo: "",
      location: "",
      price: "",
      btn: "",
      placeId: "",
      status: "active",
      totalSeats: "",
      perPersonLimit: "",
      img: null,
    });
    setEditingId(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    });

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/live-events?id=${editingId}` : "/api/admin/live-events";

    try {
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        toast.success(editingId ? "Event updated!" : "Event added!");
        closeModal();
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Something went wrong!"}`);
      }
    } catch (error) {
      toast.error("Failed to submit form. Check your network.");
      console.error(error);
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      dateFrom: event.dateFrom || "",
      dateTo: event.dateTo || "",
      location: event.location,
      price: event.price,
      btn: event.btn,
      placeId: event.placeId?._id || "",
      status: event.status || "active",
      totalSeats: event.totalSeats || "",
      perPersonLimit: event.perPersonLimit || "",
      img: event.img, // Retain existing image URL
    });
    setEditingId(event._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/live-events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted!");
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Failed to delete!"}`);
      }
    } catch (error) {
      toast.error("Failed to delete event.");
      console.error(error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", currentStatus === "active" ? "deactive" : "active");
      const res = await fetch(`/api/admin/live-events?id=${id}`, { method: "PUT", body: formData });
      if (res.ok) {
        toast.success("Status updated!");
        fetchData();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("Network error while updating status.");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Live Events</h1>
          <button
            onClick={openModal}
            className="flex items-center bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
          >
            <Plus size={20} className="mr-2" /> Add New Event
          </button>
        </div>

        {/* Events Table */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <XCircle size={48} className="inline-block mb-4 text-red-400" />
            <p className="text-lg">No live events found. Add one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.img ? (
                        <img src={ev.img} alt={ev.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded text-gray-500">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ev.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ev.dateFrom} - {ev.dateTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {places.find((p) => p._id === ev.placeId)?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ev.bookedSeats || 0} / {ev.totalSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleStatus(ev._id, ev.status)}
                        className={`px-3 py-1 text-xs font-bold rounded-full text-white ${ev.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                      >
                        {ev.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ev)}
                          className="text-purple-600 hover:text-purple-900"
                          aria-label={`Edit ${ev.title}`}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev._id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${ev.title}`}
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

      {/* Modal for Form */}
      {isModalOpen && (
        <div
          className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{editingId ? "Edit Event" : "Add New Event"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="dateFrom"
                  value={form.dateFrom}
                  onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="date"
                  name="dateTo"
                  value={form.dateTo}
                  onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                name="btn"
                value={form.btn}
                onChange={(e) => setForm({ ...form, btn: e.target.value })}
                placeholder="Button Text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="totalSeats"
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                  placeholder="Total Seats"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="number"
                  name="perPersonLimit"
                  value={form.perPersonLimit}
                  onChange={(e) => setForm({ ...form, perPersonLimit: e.target.value })}
                  placeholder="Per Person Limit"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <select
                name="placeId"
                value={form.placeId}
                onChange={(e) => setForm({ ...form, placeId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a place</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <select
                name="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
                  {form.img && (
                    <img
                      src={
                        form.img && form.img.toString() === "[object File]"
                          ? URL.createObjectURL(form.img)
                          : form.img
                      }
                      alt="Event Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    name="img"
                    onChange={(e) => setForm({ ...form, img: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {!form.img && (
                    <div className="text-center text-gray-500">
                      <ImageIcon size={32} className="inline-block mb-2" />
                      <p>Click to add image</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                >
                  {editingId ? "Update Event" : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}