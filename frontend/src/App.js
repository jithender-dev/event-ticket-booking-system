import {BrowserRouter, Routes, Route} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import MyTickets from "./pages/MyTickets"

import ProtectedRoute from "./components/ProtectedRoute"

const App = () => (
  <BrowserRouter>
    <Routes>

      <Route
        path="/"
        element={<Login />} 
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        }
      />
      

    </Routes>
  </BrowserRouter>
)

export default App
