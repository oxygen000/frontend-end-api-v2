import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Landing() {
  const [moveToRight, setMoveToRight] = useState(false);

  useEffect(() => {
    // الانتظار 10 ثواني ثم بدء التحريك كل 10 ثواني
    const timer = setTimeout(() => {
      setMoveToRight(true);

      const interval = setInterval(() => {
        setMoveToRight(prev => !prev);
      }, 10000);

      return () => clearInterval(interval);
    }, 10000);

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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: moveToRight ? 300 : 0, // يتحرك يمينًا أو يعود يسارًا
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            className="absolute text-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold py-3 cursor-pointer px-6 rounded-lg shadow-lg"
            style={{ bottom: "11%", left: "20%" }}
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
