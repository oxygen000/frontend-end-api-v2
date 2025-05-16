import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './pages/Layout';
import Landing from './pages/landing/Landing';
import Home from './pages/Home/home';
import Profiler from './pages/profiler/Profiler';
import AuthLayout from './pages/auth/AuthLayout';
import Login from './pages/auth/login/login';
import LandingLayout from './pages/landing/LandingLayout';
import AddNormalMan from './pages/register/AddNormalMan';
import AddNormalWoman from './pages/register/AddNormalWoman';
import AddDisabled from './pages/register/AddDisabled';
import AddNormalChild from './pages/register/AddNormalChild';
import Identification from './pages/Identification/identification';
import Search from './pages/Search/search';
import Userdata from './pages/users/userdata';
import { TranslationProvider } from './contexts/TranslationContext';
import { Toaster } from 'react-hot-toast';
import ChildrenSearch from './pages/ChildrenSearch/ChildrenSearch';
import DisabilitiesSearch from './pages/DisabilitiesSearch/DisabilitiesSearch';

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<LandingLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="search" element={<Search />} />
            <Route path="children" element={<ChildrenSearch />} />
            <Route path="disabilities" element={<DisabilitiesSearch />} />
            <Route path="identification" element={<Identification />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profiler />} />
            <Route path="profile/:id" element={<Profiler />} />
            <Route path="users/:id" element={<Userdata />} />
            <Route path="register">
              <Route path="man" element={<AddNormalMan />} />
              <Route path="woman" element={<AddNormalWoman />} />
              <Route path="disabled" element={<AddDisabled />} />
              <Route path="child" element={<AddNormalChild />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;
