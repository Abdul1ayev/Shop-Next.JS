"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast, ToastContainer } from "react-toastify";

type Product = {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: string;
  images: string[];
  active: boolean;
};


export default function Product_Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
const supabase = createClient();

  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("User fetch error:", error);
        return;
      }
      setUserId(data?.user?.id || null);
    };

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Product fetch error:", error);
        return;
      }

      setProduct(data);
      setSelectedImage(data.images[0]);
    };

    fetchUser();
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!userId || !product) {
      toast.error("Foydalanuvchi yoki mahsulot ma'lumotlari topilmadi!");
      return;
    }

    const quantity = 1;
    const totalPrice = parseFloat(product.price) * quantity;

    const { data: existingProduct, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Cart check error:", error);
      toast.error("Savatchani tekshirishda xatolik yuz berdi!");
      return;
    }

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + quantity;
      const newTotalPrice = parseFloat(product.price) * newQuantity;

      const { error: updateError } = await supabase
        .from("cart")
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
        })
        .eq("id", existingProduct.id);

      if (updateError) {
        console.error("Cart update error:", updateError);
        toast.error("Xatolik yuz berdi!");
      } else {
        toast.success("Mahsulot qo‘shildi");
      }
    } else {
      const { error: insertError } = await supabase.from("cart").insert([
        {
          user_id: userId,
          product_id: product.id,
          quantity: quantity,
          total_price: totalPrice,
        },
      ]);

      if (insertError) {
        console.error("Cart insert error:", insertError);
        toast.error("Xatolik yuz berdi!");
      } else {
        toast.success("Mahsulot qo‘shildi!");
      }
    }
  };
  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="w-full min-h-screen flex flex-col border border-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container mt-5 mx-auto px-4 py-10 flex flex-col md:flex-row gap-10 border border-gray-300 rounded-lg shadow-md">
        <div className="md:w-1/2 flex flex-col items-center">
          {product ? (
            <Image
              width={100}
              height={100}
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full max-w-lg h-96 object-cover rounded-lg shadow-md border border-gray-300"
            />
          ) : (
            <Skeleton height={400} width="100%" />
          )}

          <div className="flex gap-2 mt-4">
            {product
              ? product.images.map((img, index) => (
                  <Image
                    key={index}
                    width={64}
                    height={64}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 object-cover rounded-md cursor-pointer transition-all duration-200 shadow-md border border-gray-300 ${
                      selectedImage === img
                        ? "border-2 border-green-600 opacity-100"
                        : "opacity-75 hover:opacity-90"
                    }`}
                  />
                ))
              : [...Array(4)].map((_, index) => (
                  <Skeleton key={index} width={64} height={64} />
                ))}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col border border-gray-300 rounded-lg p-4 shadow-md">
          <h1 className="text-3xl font-semibold border-b pb-2">
            {product ? product.name : <Skeleton width={200} />}
          </h1>
          <p className="text-green-600 text-2xl font-bold mt-2 border-b pb-2">
            {product ? `$${product.price}` : <Skeleton width={100} />}
          </p>
          <p className="text-gray-600 mt-4 border-b pb-4">
            {product ? product.description : <Skeleton count={3} />}
          </p>

          <div className="mt-6 flex gap-4">
            {product ? (
              <>
                <button
                  onClick={handleBuyNow}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 shadow-md border border-green-700"
                >
                  Buy now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="border border-green-600 text-green-600 px-6 py-3 rounded-md hover:bg-green-100 shadow-md"
                >
                  Add To Cart
                </button>
              </>
            ) : (
              <Skeleton width={120} height={40} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
