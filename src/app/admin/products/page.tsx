"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { toast, ToastContainer } from "react-toastify";
import SidebarAdmin from "@/components/SidebarAdmin";
import { FaSpinner } from "react-icons/fa";
import { CiEdit, CiTrash } from "react-icons/ci";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: string;
  images: string[];
  active: boolean;
};

export default function Products() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "0",
    category_id: "",
    active: false,
    images: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("product").select("*");
    if (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to fetch products!");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("category").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  }

  async function handleDelete(productId: string) {
    const { error } = await supabase
      .from("product")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product!");
    } else {
      toast.success("Product deleted successfully!");
      fetchProducts();
    }
  }

  async function handleUpdate() {
    if (!formData || !formData.id) return;

    const updateData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      active: formData.active,
      category_id: formData.category_id,
      images: formData.images,
    };

    const { error } = await supabase
      .from("product")
      .update(updateData)
      .eq("id", formData.id);

    if (error) {
      toast.error(`Failed to update product! ${error.message}`);
    } else {
      toast.success("Product updated successfully!");
      setModalVisible(false);
      fetchProducts();
    }
  }

  async function handleAdd() {
    const { error } = await supabase
      .from("product")
      .insert([{ ...newProduct }]);

    if (error) {
      toast.error(`Failed to add product! ${error.message}`);
      return;
    }

    toast.success("Product added successfully!");
    setAddModalVisible(false);
    setNewProduct({
      name: "",
      description: "",
      price: "0",
      category_id: "",
      active: true,
      images: [],
    });
    fetchProducts();
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEditModal: boolean
  ) => {
    const files = e.target.files;
    if (!files) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isEditModal && formData) {
        setFormData({ ...formData, images: [...formData.images, base64] });
      } else {
        setNewProduct({
          ...newProduct,
          images: [...newProduct.images, base64],
        });
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const handleDeleteImage = (index: number, isEditModal: boolean) => {
    if (isEditModal && formData) {
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: updatedImages });
    } else {
      const updatedImages = newProduct.images.filter((_, i) => i !== index);
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="p-8 w-full flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <button
          onClick={() => setAddModalVisible(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Add New Product
        </button>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 shadow-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">#</th>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Price</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Images</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-5">
                    <FaSpinner className="animate-spin text-gray-500 text-2xl mx-auto" />
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="odd:bg-gray-50">
                    <td className="border p-3">{index + 1}</td>
                    <td className="border p-3">{product.name}</td>
                    <td className="border p-3">{product.price}$</td>
                    <td className="border p-3">
                      {product.active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </td>
                    <td className="border p-3">
                      {product.images?.map((image, i) => (
                        <Image
                          width={40}
                          height={40}
                          key={i}
                          src={image}
                          alt={`Product ${i + 1}`}
                          className="w-10 h-10 object-cover inline-block mr-2"
                        />
                      ))}
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(product);
                            setModalVisible(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded"
                        >
                          <CiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded"
                        >
                          <CiTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
      <Rodal
        visible={modalVisible}
        height={600}
        onClose={() => setModalVisible(false)}
      >
        {formData && (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-2 w-full mb-2"
              placeholder="Name"
            />
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border p-2 w-full mb-2"
              placeholder="Description"
            />
            <input
              type="text"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="border p-2 w-full mb-2"
              placeholder="Price"
            />
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="border p-2 w-full mb-2"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
              Active
            </label>
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, true)}
              className="border p-2 w-full mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, i) => (
                <div key={i} className="relative w-10 h-10">
                  <Image
                    width={100}
                    height={100}
                    src={image}
                    alt={`Product Image ${i + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div
                    onClick={() => handleDeleteImage(i, true)}
                    className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full cursor-pointer"
                  >
                    ×
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white p-2 rounded w-full"
            >
              Save
            </button>
          </div>
        )}
      </Rodal>
      {/* Add Modal */}
      <Rodal
        visible={addModalVisible}
        height={600}
        onClose={() => setAddModalVisible(false)}
      >
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="border p-2 w-full mb-2"
            placeholder="Name"
          />
          <input
            type="text"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="border p-2 w-full mb-2"
            placeholder="Description"
          />
          <input
            type="text"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="border p-2 w-full mb-2"
            placeholder="Price"
          />
          <select
            value={newProduct.category_id}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category_id: e.target.value })
            }
            className="border p-2 w-full mb-2"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={newProduct.active}
              onChange={(e) =>
                setNewProduct({ ...newProduct, active: e.target.checked })
              }
            />
            Active
          </label>
          <input
            type="file"
            onChange={(e) => handleImageUpload(e, false)}
            className="border p-2 w-full mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {newProduct.images.map((image, i) => (
              <Image
                width={40}
                height={40}
                key={i}
                src={image}
                alt={`Product Image ${i + 1}`}
                className="w-10 h-10 object-cover"
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white p-2 rounded w-full"
          >
            Add Product
          </button>
        </div>
      </Rodal>
    </div>
  );
}
