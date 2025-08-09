import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/create", label: "Create" },
  
  { path: "/myforms", label: "My Forms" },
];

const green = "#2e7d32";
const greenLight = "rgba(46, 125, 50, 0.1)";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-md shadow sticky top-0 z-50 border-b border-gray-200"
      style={{ borderColor: greenLight }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-extrabold tracking-tight select-none"
            style={{ color: green }}
          >
            Form Builder ✨
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8" aria-label="Primary Navigation">
            {navLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300
                    ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-gray-700 hover:bg-green-100"
                    }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: green }
                    : undefined
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-1 origin-left transform transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{ backgroundColor: green }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset"
            style={{ color: green }}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              className={`h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-90" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              style={{ stroke: green }}
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200"
            style={{ borderColor: greenLight }}
          >
            <div className="px-6 pt-4 pb-6 space-y-1">
              {navLinks.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-300
                    ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-gray-700 hover:bg-green-100"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { backgroundColor: green }
                      : undefined
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
