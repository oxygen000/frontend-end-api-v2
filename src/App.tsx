import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './pages/Layout'
import Landing from './pages/landing/Landing'
import Home from './pages/Home/home'
import Profiler from './pages/profiler/Profiler'
import AuthLayout from './pages/auth/AuthLayout'
import Login from './pages/auth/login/login'
import LandingLayout from './pages/landing/LandingLayout'
import AddNormalMan from './pages/register/AddNormalMan'
import AddNormalWoman from './pages/register/AddNormalWoman'
import AddDisabled from './pages/register/AddDisabled'
import AddNormalChild from './pages/register/AddNormalChild'
import Identification from './pages/Identification/identification'
import Search from './pages/Search/search'
import Userdata from './pages/users/userdata'

function App() {

  return (
    <>
<BrowserRouter>
  <Routes>
    {/* صفحات لا تتطلب تسجيل الدخول (Layout خاص) */}    
      <Route element={<LandingLayout />}>
      <Route path="/" element={<Landing />} />
    </Route>

    {/* صفحات تتطلب تسجيل الدخول (Layout خاص) */}
    <Route element={<Layout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/register/man" element={<AddNormalMan />} />
      <Route path="/register/woman" element={<AddNormalWoman />} />
      <Route path="/register/child" element={<AddNormalChild />} />
      <Route path="/register/disabled" element={<AddDisabled />} />
      <Route path="/identification" element={<Identification />} />
        <Route path="/user/:id" element={<Userdata />} />
      <Route path="/Search" element={<Search />} />
      <Route path="/profile" element={<Profiler />} />
    </Route>

    {/* صفحات تسجيل الدخول (Layout خاص) */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
    </Route>
  </Routes>
</BrowserRouter>

    </>
  )
}

export default App


