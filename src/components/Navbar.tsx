"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Menu, X, ShoppingCart, LogOut, User } from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  role: string;
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (session?.user) {
        const { data: userData } = await supabase
          .from("user")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          setUser({ id: session.user.id, role: userData.role });
        }
      }
    };
    checkUser();
  }, [supabase]); 

  useEffect(() => {
    if (!user) return;

    const fetchCartCount = async () => {
      const { data, error } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id);

      if (!error && data) {
        setCartCount(data.length);
      }
    };

    fetchCartCount();

    const channel = supabase
      .channel("cart-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart",
          filter: `user_id=eq.${user.id}`,
        },
        fetchCartCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCartCount(0);
    router.push("/");
  };

  return (
    <>
      <nav className="flex justify-between h-[60] items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-3xl font-bold text-green-600"
          >
            GREENSHOP
          </button>
        </div>

        <ul
          className={`${
            menuOpen
              ? "flex flex-col absolute left-0 right-0 items-center"
              : "hidden"
          } md:flex md:items-center md:space-x-6 bg-white w-full md:w-auto top-16 transition-all duration-300 ease-in-out p-4 md:p-0 shadow-md md:shadow-none rounded-md md:rounded-none`}
        >
          {pathname !== "/" && (
            <li>
              <button
                onClick={() => router.push("/")}
                className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
              >
                Home
              </button>
            </li>
          )}

          {user?.role === "admin" && pathname !== "/admin" && (
            <li>
              <button
                onClick={() => router.push("/admin")}
                className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
              >
                Admin
              </button>
            </li>
          )}
          <li className="relative">
            {pathname !== "/cart" && (
              <button
                onClick={() => router.push("/cart")}
                className="relative flex items-center mx-auto gap-2 border-2 border-green-700 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </li>
          <li className="relative">
            {user ? (
              <div className="relative mt-4">
                <Image
                  width={48}
                  height={48}
                  src="https://static.vecteezy.com/system/resources/previews/016/009/835/non_2x/the-human-icon-and-logo-vector.jpg"
                  alt="User"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-12 h-12 rounded-full border-2 border-gray-500 transition-all hover:border-gray-800 p-1 cursor-pointer"
                />

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-md p-2 w-40 z-50">
                    {pathname !== "/cabinet" && (
                      <button
                        onClick={() => router.push("/cabinet")}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md"
                      >
                        <User size={18} className="mr-2" />
                        Cabinet
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-red-600"
                    >
                      <LogOut size={18} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              pathname !== "/login" && (
                <button
                  onClick={() => router.push("/login")}
                  className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
                >
                  LogIn
                </button>
              )
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}
