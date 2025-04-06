"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  active: boolean;
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

const Product = () => {
  const router = useRouter();
  const supabase = createClient();
  const [product, setProduct] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }
    return data as Product[];
  }, [supabase]);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }
    return data as Category[];
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const products = await fetchProducts();
      const categories = await fetchCategories();
      setProduct(products);
      setCategory(categories);
      setLoading(false);
    };
    fetchData();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = product.filter((p) => {
    return (
      (selectedCategory === "" || p.category_id === selectedCategory) &&
      parseFloat(p.price) >= priceRange[0] &&
      parseFloat(p.price) <= priceRange[1] &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!onlyActive || p.active)
    );
  });

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-6 mt-6">
      <div className="w-full md:w-1/4 p-4 border rounded shadow-md text-green-700 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">Filters</h2>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border text-green-600 p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {category.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="border p-2 rounded w-1/2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="border p-2 rounded w-1/2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-3">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={() => setOnlyActive(!onlyActive)}
            className="accent-green-500"
          />
          Show Only Active
        </label>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border shadow-md overflow-hidden p-4 flex flex-col h-full"
                >
                  <Skeleton height={192} />
                  <h2 className="text-xl font-bold mt-2">
                    <Skeleton width={150} />
                  </h2>
                  <p className="text-green-700 mt-2 flex-1">
                    <Skeleton count={2} />
                  </p>
                  <div className="mt-auto text-center">
                    <Skeleton width={50} height={20} />
                    <Skeleton
                      width={120}
                      height={36}
                      className="block mx-auto mt-4"
                    />
                  </div>
                </div>
              ))
          : filteredProducts.map((product) => (
              <div
                className="bg-white rounded-lg border shadow-md overflow-hidden flex flex-col h-full"
                key={product.id}
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-green-800">
                    {product.name}
                  </h2>
                  <p className="text-green-700 line-clamp-3 flex-1">
                    {product.description.substring(0, 150)}...
                  </p>
                  <div className="mt-4 text-center text-xl font-bold text-green-800">
                    ${product.price}
                  </div>
                  <button
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="border-green-700 block border-2  mx-auto text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Product;
