import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop للموبايل */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg z-40 md:w-72"
          >
            <div className="flex flex-col h-full p-6 relative">
              {/* Logo / Title */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold">Navigation</h2>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-4">
                <Link to="/identification" className="block px-3 py-2 rounded hover:bg-gray-700 transition">Identification</Link>
                <Link to="/Search" className="block px-3 py-2 rounded hover:bg-gray-700 transition">Search</Link>
                <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-700 transition">Settings</Link>
              </nav>

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-700">
                <button onClick={onClose} className="w-full text-left px-3 py-2 rounded hover:bg-red-600 transition">
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
