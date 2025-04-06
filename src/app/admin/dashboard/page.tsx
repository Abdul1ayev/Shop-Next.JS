"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";

const supabase = createClient();

export default function Dashboard() {
  const [categories, setCategories] = useState(0);
  const [products, setProducts] = useState(0);
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedStats = localStorage.getItem("stats");
    if (cachedStats) {
      try {
        const parsedStats = JSON.parse(cachedStats);
        setCategories(parsedStats.categories || 0);
        setProducts(parsedStats.products || 0);
        setUsers(parsedStats.users || 0);
        setOrders(parsedStats.orders || 0);
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse cached stats:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoryRes, productRes, userRes, orderRes] = await Promise.all([
          supabase.from("category").select("*", { count: "exact", head: true }),
          supabase.from("product").select("*", { count: "exact", head: true }),
          supabase.from("user").select("*", { count: "exact", head: true }),
          supabase.from("order").select("*", { count: "exact", head: true }),
        ]);

        const newStats = {
          categories: categoryRes.count ?? 0,
          products: productRes.count ?? 0,
          users: userRes.count ?? 0,
          orders: orderRes.count ?? 0,
        };

        localStorage.setItem("stats", JSON.stringify(newStats));

        setCategories(newStats.categories);
        setProducts(newStats.products);
        setUsers(newStats.users);
        setOrders(newStats.orders);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Categories", value: categories, icon: <FaLayerGroup /> },
    { label: "Products", value: products, icon: <FaBoxOpen /> },
    { label: "Users", value: users, icon: <FaUsers /> },
    { label: "Orders", value: orders, icon: <FaShoppingCart /> },
  ];

  return (
    <div className="p-3 min-h-screen bg-white">
      <div className="">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-lg">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {statCards.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-md transition-all flex items-center gap-5 
                  hover:shadow-xl hover:scale-105 duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 text-3xl rounded-full">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{item.label}</p>
                    <h3 className="text-4xl font-medium text-gray-700">
                      {item.value}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-xl font-semibold text-gray-800">
                Recent Sales
              </h4>
              <p className="text-gray-600">You made {orders} sales.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
