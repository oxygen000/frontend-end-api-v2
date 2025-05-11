import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* محتوى الصفحة */}
      <main className="">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout
