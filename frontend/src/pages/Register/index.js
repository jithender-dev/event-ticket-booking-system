import {useState} from "react"
import {useNavigate, Link} from "react-router-dom"
import api from "../../api"
import "./index.css"

const Register = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("attendee")
  const [errorMsg, setErrorMsg] = useState("")

  const navigate = useNavigate()

  const onSubmitForm = async event => {

    event.preventDefault()

    setErrorMsg("")

    if (
      name === "" ||
      email === "" ||
      password === ""
    ) {
      setErrorMsg("Please fill all fields")
      return
    }

    try {

      await api.post(
        "/api/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      )

      navigate("/")

    } catch (error) {

      if (error.response) {
        setErrorMsg(error.response.data)
      } else {
        setErrorMsg("Registration Failed")
      }
    }
  }

  return (
    <div className="register-container">

      <form
        onSubmit={onSubmitForm}
        className="register-form"
      >

        <h1 className="heading">
          Register
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={event =>
            setName(event.target.value)
          }
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={event =>
            setEmail(event.target.value)
          }
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={event =>
            setPassword(event.target.value)
          }
        />

        <br />
        <br />

        <select
          value={role}
          onChange={event =>
            setRole(event.target.value)
          }
        >
          <option value="attendee">
            Attendee
          </option>
          <option value="organizer">
            Organizer
          </option>
        </select>

        <br />
        <br />

        <button type="submit">
          Register
        </button>

        {errorMsg && (
          <p className="error-message">
            {errorMsg}
          </p>
        )}

        <p className="paraElement">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </p>

      </form>

    </div>
  )
}

export default Register