"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/supabase/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

type CartItem = {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  product: {
    name: string;
    price: string;
    images: string[];
  };
};

export default function Checkout() {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    address: "",
    phone: "",
    notes: "",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchCart = useCallback(async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast.error("Foydalanuvchi topilmadi.");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("cart")
      .select(
        `
        id, 
        product_id, 
        user_id, 
        quantity, 
        total_price, 
        product:product_id (name, price, images)
      `
      )
      .eq("user_id", userId);

    if (error || !data) {
      toast.error("Savatcha ma'lumotlarini olishda xatolik yuz berdi.");
    } else {
      const formattedData: CartItem[] = data.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        user_id: item.user_id,
        quantity: item.quantity,
        total_price: item.total_price,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      }));

      setCartItems(formattedData);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast.error("Foydalanuvchi topilmadi.");
      return;
    }

    const userId = userData.user.id;

    if (cartItems.length === 0) {
      toast.error("Savatcha bo'sh!");
      return;
    }

    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.total_price,
      0
    );

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          first_name: form.firstName,
          address: form.address,
          phone: form.phone,
          notes: form.notes,
          total_price: totalPrice,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Buyurtma yaratishda xatolik yuz berdi.");
      return;
    }

    const orderId = data.id;

    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
      total_price: item.total_price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      toast.error("Buyurtma yaratishda xatolik yuz berdi.");
      return;
    }

    await supabase.from("cart").delete().eq("user_id", userId);

    toast.success("Buyurtma yaratildi.");
    setCartItems([]);
    setForm({ firstName: "", email: "", address: "", phone: "", notes: "" });
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container mx-auto p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">
            Checkout
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <input
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="border p-3 col-span-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <input
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <textarea
              name="notes"
              placeholder="Notes"
              className="border p-3 col-span-2 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>
          </form>
          <button
            onClick={handleSubmit}
            className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
            type="submit"
          >
            Submit
          </button>
        </div>

        <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-center text-gray-700">
            Your Cart
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-gray-500">No items in cart</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="border rounded-lg p-3 flex items-center gap-4"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-green-700 font-semibold">
                      {item.product.name}
                    </h4>
                    <p className="text-gray-600">${item.product.price}</p>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Total: ${item.total_price}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
