import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import SignInPage from "./pages/SignInPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import {useAuthStore} from "./store/useAuthStore.ts"
import { useThemeStore } from "./store/useThemeStore.ts"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"

function App() {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers}:any = useAuthStore()
  const {theme}:any = useThemeStore();

  console.log(onlineUsers)
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth]);
  
  
  if(isCheckingAuth && !authUser){
    <div className="flex justify-center items-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  }
  
  console.log(authUser);
  return (
    <>
      <div data-theme={theme}>
        <Navbar/>
        <Routes>
          <Route path="/" element={authUser ? <HomePage/> : <Navigate to={"/signin"}/>}/>
          <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to={"/"} /> }/>
          <Route path="/signin" element={!authUser ? <SignInPage/> : <Navigate to={"/"}/> }/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to={""}/> }/>
        </Routes>
        <Toaster/>
      </div>
    </>
  )
}

export default App
