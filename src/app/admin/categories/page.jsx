'use client';

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Tag, ImageIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(null);
  const [image, setImage] = useState(null); // ✅ hero image
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('tagline', tagline);
    formData.append('description', description);
    if (icon) formData.append('icon', icon);
    if (image) formData.append('image', image); // ✅ hero image

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/admin/categories?id=${editingId}` : '/api/admin/categories';

    try {
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        toast.success(editingId ? "Category updated!" : "Category added!");
        closeModal();
        fetchCategories();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Something went wrong!"}`);
      }
    } catch (err) {
      toast.error("Failed to submit form. Please check your network.");
    }
  };

  // Edit
  const handleEdit = (category) => {
    setName(category.name);
    setTagline(category.tagline || '');
    setDescription(category.description || '');
    setEditingId(category._id);
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Category deleted!");
        fetchCategories();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || "Failed to delete!"}`);
      }
    } catch (err) {
      toast.error("Failed to delete category.");
    }
  };

  const openModal = () => {
    setEditingId(null);
    setName('');
    setTagline('');
    setDescription('');
    setIcon(null);
    setImage(null); // ✅ reset hero image
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setTagline('');
    setDescription('');
    setIcon(null);
    setImage(null); // ✅ reset hero image
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white shadow-xl rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
          >
            <Plus size={18} />
            Add New Category
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
                  <th className="p-4 font-semibold">Icon</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Tagline</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Hero Image</th> {/* ✅ hero column */}
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden flex items-center justify-center">
                          {cat.icon ? (
                            <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <div className="text-gray-400"><ImageIcon size={32} /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-800 font-medium">{cat.name}</td>
                      <td className="p-4 text-gray-800">{cat.tagline || '-'}</td>
                      <td className="p-4 text-gray-800">{cat.description || '-'}</td>
                      <td className="p-4">
                        {cat.image ? <img src={cat.image} alt={cat.name} className="w-20 h-12 object-cover rounded" /> : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(cat)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors" title="Edit Category">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete Category">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No categories found. Add a new one to get started!
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
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors" title="Close">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Category Name</label>
                <div className="relative">
                  <input type="text" placeholder="e.g., Food & Drink" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
                  <Tag size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Tagline</label>
                <input type="text" placeholder="Short tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea placeholder="Detailed description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Category Icon</label>
                <input type="file" onChange={(e) => setIcon(e.target.files[0])} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Hero Image</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors">{editingId ? "Update Category" : "Add Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
