import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // استبدال useRouter بـ useNavigate
import { users } from '../../../types/users'; // تأكد أن المسار صحيح وفق بنية مشروعك

function Login() {
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('user123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // استخدام useNavigate من react-router-dom

  const handleLogin = () => {
    setIsLoading(true);

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      // Store the logged-in user ID in localStorage
      localStorage.setItem('loggedInUserId', user.id.toString());
      localStorage.setItem('loggedInUsername', user.username);

      setError('');
      setIsLoading(false);
      navigate('/home'); // Redirect to profile page instead of home
    } else {
      setError('Invalid username or password.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/login/login.png')",
        backgroundSize: '100% 100%', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* الخلفية */}

      {/* المحتوى */}
      <div className="relative z-10 flex items-center md:justify-start justify-center h-full m-10">
        <div className="relative w-full max-w-[450px] items-center justify-center px-4 lg:px-0">
          <div
            className="bg-[#00e0fb] bg-opacity-20 rounded-xl shadow-xl p-8 backdrop-blur-sm h-full hover:shadow-2xl transition duration-300"
            style={{
              backgroundColor: 'rgba(0, 224, 251, 0.2)'              
            }}
          >
            <h2 className="text-3xl font-bold text-center text-white mb-6">
              Login
            </h2>

            {error && (
              <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-white text-lg font-medium mb-2 text-left"
              >
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
              <label
                htmlFor="password"
                className="block text-white text-lg font-medium mb-2 text-left"
              >
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
                <a
                  href="/forgot-password"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
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
                'Login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
