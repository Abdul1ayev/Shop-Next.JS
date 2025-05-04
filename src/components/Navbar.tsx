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

  const handleNavigation = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <nav className="flex h-[110px] justify-between items-center bg-white shadow-md sticky top-0 z-50 p-4">
      <div className="flex items-center space-x-4">
        <button 
          className="md:hidden" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={28} className="text-gray-700" aria-hidden="true" />
          ) : (
            <Menu size={28} className="text-gray-700" aria-hidden="true" />
          )}
        </button>
        <button
          onClick={() => handleNavigation("/")}
          className="text-3xl font-bold text-green-600 hover:text-green-700 transition-colors"
        >
          GREENSHOP
        </button>
      </div>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex md:items-center md:space-x-6">
        {pathname !== "/" && (
          <li>
            <button
              onClick={() => handleNavigation("/")}
              className="border-green-700 border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded"
            >
              Home
            </button>
          </li>
        )}

        {user?.role === "admin" && pathname !== "/admin" && (
          <li>
            <button
              onClick={() => handleNavigation("/admin")}
              className="border-green-700 border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded"
            >
              Admin
            </button>
          </li>
        )}
        
        <li className="relative">
          {pathname !== "/cart" && (
            <button
              onClick={() => handleNavigation("/cart")}
              className="relative flex items-center gap-2 border-2 border-green-700 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart size={22} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </li>
        
        <li className="relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Image
                  width={48}
                  height={48}
                  src="https://static.vecteezy.com/system/resources/previews/016/009/835/non_2x/the-human-icon-and-logo-vector.jpg"
                  alt="User profile"
                  className="w-12 h-12 rounded-full border-2 border-gray-500 hover:border-gray-800 transition-all"
                />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 bg-white shadow-lg border rounded-md p-2 w-40 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {pathname !== "/cabinet" && (
                    <button
                      onClick={() => handleNavigation("/cabinet")}
                      className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md"
                    >
                      <User size={18} className="mr-2" aria-hidden="true" />
                      Cabinet
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-red-600"
                  >
                    <LogOut size={18} className="mr-2" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            pathname !== "/login" && (
              <button
                onClick={() => handleNavigation("/login")}
                className="border-green-700 border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded"
              >
                Log In
              </button>
            )
          )}
        </li>
      </ul>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Content */}
          <div className="absolute top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <button
                onClick={() => handleNavigation("/")}
                className="text-2xl font-bold text-green-600"
              >
                GREENSHOP
              </button>
              <button 
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {pathname !== "/" && (
                <button
                  onClick={() => handleNavigation("/")}
                  className="w-full text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
                >
                  Home
                </button>
              )}

              {user?.role === "admin" && pathname !== "/admin" && (
                <button
                  onClick={() => handleNavigation("/admin")}
                  className="w-full text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
                >
                  Admin
                </button>
              )}

              {pathname !== "/cart" && (
                <button
                  onClick={() => handleNavigation("/cart")}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <>
                  {pathname !== "/cabinet" && (
                    <button
                      onClick={() => handleNavigation("/cabinet")}
                      className="w-full flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <User size={18} className="mr-2" aria-hidden="true" />
                      Cabinet
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-red-600"
                  >
                    <LogOut size={18} className="mr-2" aria-hidden="true" />
                    Logout
                  </button>
                </>
              ) : (
                pathname !== "/login" && (
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Log In
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}