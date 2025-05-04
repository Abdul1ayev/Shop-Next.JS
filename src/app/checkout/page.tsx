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

  const totalPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Checkout
        </h1>
        
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Order Summary - Comes first on mobile */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-sm p-4 order-2 lg:order-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Your Order
            </h2>
            
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading...</p>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <a 
                  href="/" 
                  className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                >
                  Continue Shopping
                </a>
              </div>
            ) : (
              <>
                <ul className="divide-y">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-3 flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-gray-800 font-medium">
                          {item.product.name}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>${item.product.price} × {item.quantity}</span>
                          <span>${item.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-medium text-gray-700 mb-2">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-700 mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-green-700 mt-4 pt-2 border-t">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Checkout Form - Comes second on mobile */}
          <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-sm p-4 order-1 lg:order-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Billing Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John Doe"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+998901234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main St, Tashkent"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    placeholder="Any special instructions..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={cartItems.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white mt-6 ${
                  cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } transition-colors`}
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}