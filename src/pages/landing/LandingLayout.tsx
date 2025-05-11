import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* محتوى الصفحة */}
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
