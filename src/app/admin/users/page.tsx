"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import SidebarAdmin from "@/components/SidebarAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

type User = {
  id: string;
  username: string;
  email: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"email">("email");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter((user) =>
      user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "email") {
      filtered = filtered.sort((a, b) => a.email.localeCompare(b.email));
    }

    setFilteredUsers(filtered);
  }, [search, sortBy, users]);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user")
      .select("id, username, email");
    if (error) {
      toast.error("Failed to fetch users!");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="p-8 w-full">
        <h1 className="text-2xl font-bold mb-4">Users</h1>

        <div className="mb-4 flex gap-4">
          <input
            type="text"
            className="border p-2 rounded flex-grow focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search by email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "email")}
          >
            <option value="email">Sort by Email</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{user.username}</td>
                    <td className="border p-2">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
