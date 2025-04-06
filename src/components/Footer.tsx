import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white shadow-emerald-700 border-t-2 shadow-2xl text-green-400 py-6 mt-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Services", "Contact"].map(
                (item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-green-400 hover:text-green-300 transition duration-300"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-green-400" />
                <span>info@mywebsite.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-green-400" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-400" />
                <span>123 Main St, City, Country</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300">
              Newsletter
            </h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter to get the latest updates.
            </p>
            <form className="flex border rounded-sm">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-l-md focus:outline-none text-gray-900"
              />
              <button
                type="submit"
                className="bg-green-600 border-2 text-white px-4 py-2 rounded-r-md hover:bg-green-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              {[
                { icon: FaFacebook, link: "#" },
                { icon: FaTwitter, link: "#" },
                { icon: FaInstagram, link: "#" },
                { icon: FaGithub, link: "#" },
                { icon: FaLinkedin, link: "#" },
              ].map(({ icon: Icon, link }, index) => (
                <a
                  key={index}
                  href={link}
                  className="text-green-400 hover:text-green-300 transition duration-300"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-green-800 mt-8 pt-6 text-center">
          <p className="text-green-400 text-sm">
            &copy; {new Date().getFullYear()} MyWebsite. All rights reserved.
          </p>
          <p className="text-green-400 text-sm mt-2">
            Designed by{" "}
            <a href="#" className="hover:text-green-300">
              Abdullayev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
