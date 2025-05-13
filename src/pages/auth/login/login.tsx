import { useState } from "react";
import { useNavigate } from "react-router-dom"; // استبدال useRouter بـ useNavigate
import { users } from "../../../types/users"; // تأكد أن المسار صحيح وفق بنية مشروعك

function Login() {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // استخدام useNavigate من react-router-dom

  const handleLogin = () => {
    setIsLoading(true);

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      setError("");
      setIsLoading(false);
      navigate("/home"); // توجيه إلى الصفحة الرئيسية
    } else {
      setError("Invalid username or password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden"
    style={{
    backgroundImage: "url('https://limewire.com/decrypt?downloadUrl=https%3A%2F%2Flimewire-filesharing-production.b61cdfd8cf17f52ddc020162e738eb5d.r2.cloudflarestorage.com%2Fbuckets%2Fbe8b6d24-4ac8-45ca-8f63-c1a2e173960c%2Fa4c3ac1b-b0a0-4744-bc5a-e29d10ae416d%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Date%3D20250511T223100Z%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Credential%3Da1868571dfad6d4fe293ee5b945a0ad5%252F20250511%252Fauto%252Fs3%252Faws4_request%26X-Amz-Expires%3D14400%26X-Amz-Signature%3Da4bd972b1aa23f7281ddf77aaebdc7fd7c35ee0e88851deff315e59220f8f352&mediaType=image%2Fgif&decryptionSession=eyJhZXNKd2tHY20iOnsiYWVzS2V5VHlwZSI6IlNZTU1FVFJJQ19BRVMtR0NNX0tFWSIsImp3ayI6eyJhbGciOiJBMjU2R0NNIiwiZXh0Ijp0cnVlLCJrIjoicXF2cEhmMVMzTmFpS1M4aWJ0SlhMUWpBT0djSGx4dnZyc0VnQS1SWVEtTSIsImtleV9vcHMiOlsiZW5jcnlwdCIsImRlY3J5cHQiXSwia3R5Ijoib2N0In19LCJhZXNKd2tDdHIiOnsiYWVzS2V5VHlwZSI6IlNZTU1FVFJJQ19BRVMtQ1RSX0tFWSIsImp3ayI6eyJhbGciOiJBMjU2Q1RSIiwiZXh0Ijp0cnVlLCJrIjoicXF2cEhmMVMzTmFpS1M4aWJ0SlhMUWpBT0djSGx4dnZyc0VnQS1SWVEtTSIsImtleV9vcHMiOlsiZW5jcnlwdCIsImRlY3J5cHQiXSwia3R5Ijoib2N0In19fQ')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
      {/* الخلفية */}


      {/* المحتوى */}
      <div className="relative z-10 flex items-center md:justify-end justify-center h-full m-10">
        <div className="relative w-full max-w-[450px] md:h-[90%] h-[50%] px-4 lg:px-0">
          <div
            className="bg-blue-500 bg-opacity-20 rounded-xl shadow-xl p-8 backdrop-blur-sm h-full hover:shadow-2xl transition duration-300"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
            }}
          >
            <h2 className="text-3xl font-bold text-center text-white mb-6">Login</h2>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="mb-4">
              <label htmlFor="username" className="block text-white text-lg font-medium mb-2">
                User
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 placeholder-gray-300 text-white rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-white text-lg font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md border placeholder-gray-300 text-white border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <div className="mt-4">
                <a href="/forgot-password" className="text-blue-500 hover:text-blue-700 text-sm">
                  Forgot your password
                </a>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
