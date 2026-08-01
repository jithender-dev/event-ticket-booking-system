import {useNavigate, Link} from "react-router-dom"
import {useState} from "react"

import api from "../../api"
import "./index.css"

const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const navigate = useNavigate()

  const onSubmitForm = async event => {

    event.preventDefault()

    setErrorMsg("")

    if (email === "" || password === "") {
      setErrorMsg("Please fill all fields")
      return
    }

    try {

      const response = await api.post(
        "/api/auth/login",
        {
          email,
          password,
        }
      )

      localStorage.setItem(
        "jwt_token",
        response.data.jwtToken
      )

      navigate("/events")

    } catch (error) {

      if (error.response) {
        setErrorMsg(error.response.data)
      } else {
        setErrorMsg("Login Failed")
      }
    }
  }

  return (
    <div className="login-container">

      <form
        className="login-form"
        onSubmit={onSubmitForm}
      >

        <h1 className="headingElement">
          Login
        </h1>

        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={event =>
            setEmail(event.target.value)
          }
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={event =>
            setPassword(event.target.value)
          }
        />

        <button
          className="login-btn"
          type="submit"
        >
          Login
        </button>

        {errorMsg && (
          <p className="error-message">
            {errorMsg}
          </p>
        )}

        <p className="paraElement">
          New User?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>

    </div>
  )
}

export default Login