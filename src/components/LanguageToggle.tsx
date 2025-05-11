import { useState } from "react";
import { FaGlobeAmericas, FaGlobeAfrica  } from "react-icons/fa"; // استيراد أيقونات

function LanguageToggle() {
  const [language, setLanguage] = useState<string>(() => localStorage.getItem("language") || "en");

  // دالة لتبديل اللغة
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en"; // التبديل بين اللغة الإنجليزية والعربية
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage); // تخزين اللغة في التخزين المحلي
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 text-white  rounded-full transition duration-300"
    >
      {language === "en" ? (
        <FaGlobeAmericas className="text-xl" />
      ) : (
        <FaGlobeAfrica className="text-xl" />
      )}
    </button>
  );
}

export default LanguageToggle;
