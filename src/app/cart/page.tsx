"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
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

const supabase = createClient();

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
      setCheckingUser(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cart")
          .select("*, product:product_id (name, price, images)")
          .eq("user_id", userId);

        if (error) throw error;

        setCartItems(data || []);
      } catch (err) {
        toast.error("Error loading cart!");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchCart();
  }, [userId]);

  const handleRemoveItem = async (id: string) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) {
      toast.error("Error removing item!");
    } else {
      toast.success("Item removed successfully!");
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(id);
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newTotalPrice = parseFloat(item.product.price) * newQuantity;
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity, total_price: newTotalPrice })
      .eq("id", id);

    if (error) {
      toast.error("Error updating quantity!");
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id
            ? { ...item, quantity: newQuantity, total_price: newTotalPrice }
            : item
        )
      );
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  if (checkingUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">
            Shopping Cart 🛒
          </h1>
          <p className="text-center text-gray-700 text-lg mb-14 font-semibold">
            Please register or log in!
          </p>
        </div>
        <div className="flex-grow"></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center text-gray-800">
          Shopping Cart 🛒
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push("/")}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse rounded-lg shadow-xl border border-green-700 overflow-hidden">
                <thead>
                  <tr className="bg-green-600 text-white text-center">
                    <th className="border border-green-700 px-2 py-3">Image</th>
                    <th className="border border-green-700 px-2 py-3">
                      Product
                    </th>
                    <th className="border border-green-700 px-2 py-3">Price</th>
                    <th className="border border-green-700 px-2 py-3">
                      Quantity
                    </th>
                    <th className="border border-green-700 px-2 py-3">Total</th>
                    <th className="border border-green-700 px-2 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-green-100">
                      <td className="border border-green-700 p-2 text-center">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg mx-auto"
                        />
                      </td>
                      <td className="border border-green-700 p-4 py-1 text-center">
                        {item.product.name}
                      </td>
                      <td className="border border-green-700 p-4 py-1 text-center">
                        ${item.product.price}
                      </td>
                      <td className="border border-green-700 p-4 py-1 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            className="p-1 bg-green-200 rounded-lg hover:bg-green-300 transition-all"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <FaMinus className="text-green-800" />
                          </button>
                          <span className="mx-2 text-lg font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1 bg-green-200 rounded-lg hover:bg-green-300 transition-all"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <FaPlus className="text-green-800" />
                          </button>
                        </div>
                      </td>
                      <td className="border border-green-700 p-4 py-1 text-center">
                        ${item.total_price.toFixed(2)}
                      </td>
                      <td className="border border-green-700 p-4 py-1 text-center">
                        <button
                          className="text-red-700 hover:text-red-500 transition-all"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.product.name}
                      </h3>
                      <p className="text-green-600 font-medium">
                        ${item.product.price}
                      </p>
                      <div className="flex items-center mt-2">
                        <button
                          className="p-1 bg-green-200 rounded-lg hover:bg-green-300 transition-all"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <FaMinus className="text-green-800" />
                        </button>
                        <span className="mx-3 text-lg font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          className="p-1 bg-green-200 rounded-lg hover:bg-green-300 transition-all"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <FaPlus className="text-green-800" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-700 font-medium">
                          Total: ${item.total_price.toFixed(2)}
                        </p>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Order Summary
                </h2>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}