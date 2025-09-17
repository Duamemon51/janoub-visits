"use client";

import { useState } from "react";
import useSWR from "swr";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, ImageIcon, X } from "lucide-react";

// Safe fetcher with authentication token
const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch data.");
      }
      return res.json();
    })
    .then((json) => (Array.isArray(json) ? json : []));

// Reusable Image Card component
function ImageCard({ label, file, setFile }) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const previewSrc = file instanceof File ? URL.createObjectURL(file) : file;

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
        {previewSrc && (
          <img
            src={previewSrc}
            alt={`Preview ${label}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {!previewSrc && <ImageIcon size={32} className="text-gray-400" />}
      </div>
    </div>
  );
}

export default function AdminDestinationsPage() {
  const { data: destinations, mutate } = useSWR("/api/admin/destinations", fetcher);
  const { data: places } = useSWR("/api/admin/places", fetcher);
  const { data: categories } = useSWR("/api/admin/categories", fetcher);

  const [form, setForm] = useState({
    title: "",
    tag: "",
    body: "",
    imagesMain: null,
    imagesSmall1: null,
    imagesSmall2: null,
    imagesSmall3: null,
    infoTitle: "",
    location: "",
    ages: "",
    activities: [],
    hoursValue: "",
    closedNow: "",
    imgFile: null,
    placeId: "",
    categoryId: "",
  });

  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!destinations || !places || !categories) return <p>Loading...</p>;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setForm({
      title: "",
      tag: "",
      body: "",
      imagesMain: null,
      imagesSmall1: null,
      imagesSmall2: null,
      imagesSmall3: null,
      infoTitle: "",
      location: "",
      ages: "",
      activities: [],
      hoursValue: "",
      closedNow: "",
      imgFile: null,
      placeId: "",
      categoryId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `/api/admin/destinations/${editId}`
      : "/api/admin/destinations";
    const method = editId ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("tag", form.tag);
    formData.append("body", form.body);
    formData.append("infoTitle", form.infoTitle);
    formData.append("location", form.location);
    formData.append("ages", form.ages);
    form.activities.forEach((act) => formData.append("activities", act));
    formData.append("hoursValue", form.hoursValue);
    formData.append("closedNow", form.closedNow);
    formData.append("placeId", form.placeId);
    formData.append("categoryId", form.categoryId);

    if (form.imgFile) formData.append("img", form.imgFile);
    if (form.imagesMain) formData.append("imagesMain", form.imagesMain);
    if (form.imagesSmall1) formData.append("imagesSmall1", form.imagesSmall1);
    if (form.imagesSmall2) formData.append("imagesSmall2", form.imagesSmall2);
    if (form.imagesSmall3) formData.append("imagesSmall3", form.imagesSmall3);

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: formData,
    });

    if (res.ok) {
      toast.success(editId ? "Destination updated!" : "Destination added!");
      closeModal();
      mutate();
    } else {
      toast.error("Something went wrong!");
    }
  };

  const handleEdit = (dest) => {
    setEditId(dest._id);
    setForm({
      title: dest.title,
      tag: dest.tag,
      body: dest.body || "",
      imagesMain: dest.imagesMain || null,
      imagesSmall1: dest.imagesSmall1 || null,
      imagesSmall2: dest.imagesSmall2 || null,
      imagesSmall3: dest.imagesSmall3 || null,
      infoTitle: dest.infoTitle || "",
      location: dest.location || "",
      ages: dest.ages || "",
      activities: dest.activities || [],
      hoursValue: dest.hoursValue || "",
      closedNow: dest.closedNow || "",
      imgFile: dest.imgFile || null,
      placeId: dest.placeId?._id || "",
      categoryId: dest.categoryId?._id || "",
    });
    openModal();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/destinations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });
    if (res.ok) {
      toast.success("Deleted!");
      mutate();
    } else {
      toast.error("Failed to delete!");
    }
  };

  return (
    <div className="p-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Destinations</h1>
      <button
        onClick={openModal}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
      >
        <Plus size={20} className="inline mr-2" />
        New Destination
      </button>

      {/* Modal for Form */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-h-screen overflow-y-auto w-full max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editId ? "Edit" : "Add"} Destination
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="border p-2"
              />
              <input
                placeholder="Tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                required
                className="border p-2"
              />

              {/* Place dropdown */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Select Place
                </span>
                <select
                  value={form.placeId}
                  onChange={(e) => setForm({ ...form, placeId: e.target.value })}
                  required
                  className="border p-2"
                >
                  <option value="">-- Select Place --</option>
                  {places.map((place) => (
                    <option key={place._id} value={place._id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Category dropdown */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Select Category
                </span>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  required
                  className="border p-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* New grid for the five input fields */}
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  placeholder="Info Title"
                  value={form.infoTitle}
                  onChange={(e) =>
                    setForm({ ...form, infoTitle: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  placeholder="Ages"
                  value={form.ages}
                  onChange={(e) => setForm({ ...form, ages: e.target.value })}
                  className="border p-2"
                />
                <input
                  placeholder="Hours"
                  value={form.hoursValue}
                  onChange={(e) =>
                    setForm({ ...form, hoursValue: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  placeholder="Closed Now"
                  value={form.closedNow}
                  onChange={(e) =>
                    setForm({ ...form, closedNow: e.target.value })
                  }
                  className="border p-2"
                />
              </div>

              {/* Remaining form fields - These will span the full width */}
              <textarea
                placeholder="About Body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="border p-2 h-24 col-span-full"
              />

              {/* Image fields - also made responsive and full-width */}
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ImageCard
                  label="Main Image"
                  file={form.imagesMain}
                  setFile={(file) => setForm({ ...form, imagesMain: file })}
                />
                <ImageCard
                  label="Small Image 1"
                  file={form.imagesSmall1}
                  setFile={(file) => setForm({ ...form, imagesSmall1: file })}
                />
                <ImageCard
                  label="Small Image 2"
                  file={form.imagesSmall2}
                  setFile={(file) => setForm({ ...form, imagesSmall2: file })}
                />
                <ImageCard
                  label="Small Image 3"
                  file={form.imagesSmall3}
                  setFile={(file) => setForm({ ...form, imagesSmall3: file })}
                />
              </div>

              <label className="flex flex-col col-span-full">
                <span className="text-sm font-medium text-gray-700">
                  Destination Image
                </span>
                <input
                  type="file"
                  onChange={(e) =>
                    setForm({ ...form, imgFile: e.target.files[0] })
                  }
                  className="border p-2"
                />
              </label>

              <label className="flex flex-col col-span-full">
                <span className="text-sm font-medium text-gray-700">
                  Activities (Select multiple with Ctrl/Cmd)
                </span>
                <select
                  multiple
                  value={form.activities}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activities: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="border p-2"
                >
                  <option value="SHOPPING">SHOPPING</option>
                  <option value="DINING">DINING</option>
                  <option value="NATURE">NATURE</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="FARM TOUR">FARM TOUR</option>
                  <option value="CULTURE">CULTURE</option>
                </select>
              </label>

              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded mt-4 col-span-full"
              >
                {editId ? (
                  <>
                    <Edit size={18} className="inline-block mr-2" /> Update
                    Destination
                  </>
                ) : (
                  <>
                    <Plus size={18} className="inline-block mr-2" /> Add
                    Destination
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Destinations Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Place
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(destinations) ? destinations : []).map((dest) => (
              <tr key={dest._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dest.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dest.tag}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dest.placeId?.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dest.categoryId?.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(dest)}
                      className="text-purple-600 hover:text-purple-900"
                      aria-label={`Edit ${dest.title}`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(dest._id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${dest.title}`}
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
    </div>
  );
}