// App.jsx
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";


import Navbar from "./features/formBuilder/components/Navbar";
import Footer from "./features/formBuilder/components/Footer";
import {Toaster} from 'sonner'
import CreateFormPage from "./pages/CreateFormPage";
import PreviewFormPage from "./pages/PreviewFormPage";
import MyFormsPage from "./pages/MyFormsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 flex flex-col" style={{ backgroundColor: "rgba(41, 171, 135, 0.15)" }}>
      <Navbar />
      <Toaster position="top-center" />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full"
      >
        <Routes>
          <Route path="/create" element={<CreateFormPage />} />
          <Route path="/preview" element={<PreviewFormPage />} />
          <Route path="/myforms" element={<MyFormsPage />} />
          {/* Add a 404 or redirect route here if needed */}
        </Routes>
      </motion.main>

      <Footer />
    </div>
  );
}
