import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

function Landing() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // إظهار الزر بعد 10 ثواني فقط
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Navbar */}
      <header className="absolute z-20 top-0 left-0 w-full p-4">
        <div className="flex justify-between items-center w-full">
          {/* الشعارات على اليسار */}
          <div className="flex items-center space-x-4">
            <img src="/landing/logo1.png" alt="logo1" className="h-12" />
            <img src="/landing/logo2.png" alt="logo2" className="h-12" />
          </div>

          {/* اسم التطبيق على اليمين */}
          <h1 className="text-white text-xl font-bold">Arab Republic of Egypt
            <br/>
            Ministry of Interior
          </h1>
        </div>
      </header>

      {/* خلفية الفيديو */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-fill object-center "
        >
        <source src="/landing/hero2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* المحتوى فوق الفيديو */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <AnimatePresence>
          {showButton && (
            <Link to="/login">
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.8 }}
              className="absolute text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 cursor-pointer px-6 rounded-lg shadow-lg"
              style={{ top: "60%", left: "45%", transform: "translate(-50%, -50%)" }}
            >
              Get Started  
            </motion.button>
              </Link>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Landing;
