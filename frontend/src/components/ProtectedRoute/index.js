import {Navigate} from "react-router-dom"

const ProtectedRoute = props => {

  const jwtToken = localStorage.getItem(
    "jwt_token"
  )

  if (jwtToken === null) {
    return <Navigate to="/" />
  }

  return props.children
}

export default ProtectedRoute 