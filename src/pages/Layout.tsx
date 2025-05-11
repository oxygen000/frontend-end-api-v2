import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "../components/usermenu";
import LanguageToggle from "../components/LanguageToggle";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // التبديل بين الفتح والإغلاق
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false); // إغلاق السايدبار عند النقر خارجًا أو عند الضغط على زر الخروج
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-cover bg-center">
      {/* Sidebar with toggle control */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className=""
            initial={{ x: -300, opacity: 0 }} // يبدأ من اليسار مع اختفاء
            animate={{ x: 0, opacity: 1 }} // يظهر بجانب المحتوى مع التلاشي
            exit={{ x: -300, opacity: 0 }} // يختفي عند الإغلاق مع التلاشي
            transition={{
              type: "spring", // نوع الانتقال، لجعل الحركة أكثر مرونة
              stiffness: 300, // القوة أو الصلابة
              damping: 30, // التخميد لجعل الحركة أكثر سلاسة
              duration: 0.5, // مدة الحركة
            }}
          >
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64 md:ml-72" : "ml-0"}`} // تحريك المحتوى مع السايدبار
        initial={{ opacity: 0 }} // يبدأ بالتلاشي
        animate={{ opacity: 1 }} // يظهر بشكل تدريجي مع السايدبار
        exit={{ opacity: 0 }} // يختفي عند الإغلاق
        transition={{ duration: 0.3, ease: "easeInOut" }} // انتقال سلس
      >
        {/* Page Content */}
        <motion.main
          className="flex-1 p-4 transition-all duration-300 ease-in-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            backgroundImage: "url('/back1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Navbar */}
          <motion.header
            className="p-4 flex items-center justify-between transition-all duration-300 ease-in-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Left Side: Site Name and Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar} // التبديل بين الفتح والإغلاق
                className="text-white hover:text-gray-500 focus:outline-none "
              >
                {isSidebarOpen ? (
                  <svg
                    className="w-6 h-6 transition-all duration-300 ease-in-out hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 transition-all duration-300 ease-in-out "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              <Link to={'/home'} className="text-xl text-white font-bold ml-4">Face ID</Link>
            </div>

            {/* Right Side: Language Toggle and User Menu */}
            <div className="flex items-center ml-auto gap-4">
              <LanguageToggle />
              <UserMenu />
            </div>
          </motion.header>


          {/* Page Content */}
          <Outlet />
        </motion.main>
      </motion.div>
    </div>
  );
}

export default Layout;
