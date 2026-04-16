import { Outlet } from "react-router-dom"
import SideBar from "../components/SideBar.jsx"


export default function MainLayout() {

  return (
    <div className="flex h-screen">
      {/* <div className="h-screen w-screen flex bg-gray-200"> */}
        <SideBar/>
        <main className="p-6  flex-1 min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      {/* </div> */}
    </div>
  )
}