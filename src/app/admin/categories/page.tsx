"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/supabase/client";
import SidebarAdmin from "@/components/SidebarAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

type Category = {
  id: string;
  name: string;
  active: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("category").select("*");
    if (error) {
      console.error("❌ Error fetching categories:", error);
      toast.error("Failed to fetch categories!");
    } else {
      setCategories(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function addOrUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("⚠️ Category name is required!");
      return;
    }

    setAdding(true);
    if (editingId) {
      const { error } = await supabase
        .from("category")
        .update({ name })
        .eq("id", editingId);
      if (error) {
        toast.error("Failed to update category!");
      } else {
        toast.success("Category updated successfully!");
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editingId ? { ...cat, name } : cat))
        );
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase
        .from("category")
        .insert([{ name, active: false }])
        .select();
      if (error) {
        toast.error("Failed to add category!");
      } else if (data) {
        toast.success("Category added successfully!");
        setCategories((prev) => [...prev, data[0]]);
      }
    }
    setName("");
    setAdding(false);
  }

  async function toggleCategoryStatus(id: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat))
    );

    const { error } = await supabase
      .from("category")
      .update({ active: !categories.find((cat) => cat.id === id)?.active })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update category status!");
    } else {
      toast.success("Category status updated!");
    }
  }

  async function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    const { error } = await supabase.from("category").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete category!");
    } else {
      toast.success("Category deleted successfully!");
    }
  }

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />

      <div className="p-8 w-full">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>

        <form onSubmit={addOrUpdateCategory} className="mb-6 w-1/3 flex gap-2">
          <input
            type="text"
            className="border p-2 w-1/4 rounded flex-grow focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition disabled:bg-blue-300"
            type="submit"
            disabled={adding}
          >
            {adding ? (
              <FaSpinner className="animate-spin" />
            ) : editingId ? (
              "Update"
            ) : (
              "Add"
            )}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">#</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} className="border hover:bg-gray-50 transition">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{cat.name}</td>
                  <td
                    className="border p-2 cursor-pointer"
                    onClick={() => toggleCategoryStatus(cat.id)}
                  >
                    <span
                      className={`px-2 py-1 rounded ${
                        cat.active
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {cat.active ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="border p-2 text-center flex gap-2 justify-center">
                    <button
                      className="bg-green-500 text-white p-1 rounded"
                      onClick={() => {
                        setEditingId(cat.id);
                        setName(cat.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white p-1 rounded"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
