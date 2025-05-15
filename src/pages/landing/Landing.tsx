import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Landing() {
  const [moveToRight, setMoveToRight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMoveToRight(true);

      const interval = setInterval(() => {
        setMoveToRight(prev => !prev);
      }, 9000);

      return () => clearInterval(interval);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* خلفية الفيديو */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-fill object-center"
      >
        <source src="/landing/hero2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* المحتوى فوق الفيديو */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <Link to="/login">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: moveToRight ? 800 : 0,
              y: moveToRight ? 20 : 0, // يتحرك للأعلى عندما يكون يمينًا
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            className="absolute text-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold py-3 cursor-pointer px-6 rounded-lg shadow-lg"
            style={{ bottom: "15%", left: "20%" }}
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
