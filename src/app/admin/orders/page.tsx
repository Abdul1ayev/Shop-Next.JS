"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/supabase/client";
import SidebarAdmin from "@/components/SidebarAdmin";

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  first_name: string;
  address: string;
  phone: string;
  notes: string;
  total_price: number;
  status: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Error loading orders.");
      console.error("Error loading orders:", error);
    } else {
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData("text/plain", orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedOrderId) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", draggedOrderId);

    if (error) {
      setError("Error updating status.");
      console.error("Error updating status:", error);
      return;
    }

    const updatedOrders = orders.map((order) =>
      order.id === draggedOrderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    setDraggedOrderId(null);
  };

  const groupedOrders = {
    pending: orders.filter((order) => order.status === "pending"),
    inProgress: orders.filter((order) => order.status === "in progress"),
    completed: orders.filter((order) => order.status === "completed"),
  };

  return (
    <div className="w-full min-h-screen flex bg-gray-100">
      <div>
        <SidebarAdmin />
      </div>
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6 text-gray-700">Orders</h1>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="flex gap-4">
            <div
              className="flex-1 bg-white shadow-md rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "pending")}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Pending
              </h2>
              {groupedOrders.pending.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-3 mb-3 cursor-move bg-white shadow-sm hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                >
                  <p className="font-semibold text-lg">{order.first_name}</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">ID:</span> {order.id}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {order.phone}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address:</span>{" "}
                      {order.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Price:</span> $
                      {order.total_price}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "in progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex-1 bg-white shadow-md rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "in progress")}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                In Progress
              </h2>
              {groupedOrders.inProgress.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-3 mb-3 cursor-move bg-white shadow-sm hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                >
                  <p className="font-semibold text-lg">{order.first_name}</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">ID:</span> {order.id}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {order.phone}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address:</span>{" "}
                      {order.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Price:</span> $
                      {order.total_price}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "in progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex-1 bg-white shadow-md rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "completed")}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Completed
              </h2>
              {groupedOrders.completed.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-3 mb-3 cursor-move bg-white shadow-sm hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                >
                  <p className="font-semibold text-lg">{order.first_name}</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">ID:</span> {order.id}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {order.phone}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address:</span>{" "}
                      {order.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Price:</span> $
                      {order.total_price}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "in progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
