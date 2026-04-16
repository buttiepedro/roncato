import { Outlet } from "react-router-dom"
import SideBar from "../components/SideBar.jsx"


export default function MainLayout() {

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* <div className="h-screen w-screen flex bg-gray-200"> */}
        <SideBar/>
        <main className="flex-1 min-w-0 bg-slate-50 overflow-hidden p-5">
          <Outlet />
        </main>
      {/* </div> */}
    </div>
  )
}