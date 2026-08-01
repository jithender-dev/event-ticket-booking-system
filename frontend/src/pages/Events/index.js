import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import api from "../../api"
import "./index.css"

const Events = () => {

  const [eventsList, setEventsList] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getEvents()
  }, [])

  const getEvents = async () => {

    try {

      const response = await api.get(
        "/api/events"
      )

      setEventsList(response.data)

    } catch (error) {

      console.log(error)

      alert("Failed To Fetch Events")
    }
  }

  const bookTicket = async eventId => {

    const jwtToken = localStorage.getItem(
      "jwt_token"
    )

    try {

      const response = await api.post(
        "/api/book-ticket",
        {
          eventId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )

      alert(response.data.message)

      getEvents()

    } catch (error) {

      console.log(error)

      if (error.response) {
        alert(error.response.data)
      } else {
        alert("Booking Failed")
      }
    }
  }

  const logout = () => {

    localStorage.removeItem(
      "jwt_token"
    )

    navigate("/")
  }

  return (
    <div className="events-container">

      <div className="header-container">

        <h1 className="events-heading">
          All Events
        </h1>

        <div>

          <button
            type="button"
            className="tickets-btn"
            onClick={() =>
              navigate("/my-tickets")
            }
          >
            My Tickets
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      <div className="events-list">

        {eventsList.map(eachEvent => (
          <div
            className="event-card"
            key={eachEvent.id}
          >

            <h2 className="event-title">
              {eachEvent.title}
            </h2>

            <p>
              {eachEvent.description}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {eachEvent.category}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {eachEvent.location}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {eachEvent.event_date}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {eachEvent.event_time}
            </p>

            <p>
              <strong>
                Available Seats:
              </strong>{" "}
              {eachEvent.available_seats}
            </p>

            <p>
              <strong>
                Ticket Price:
              </strong>{" "}
              ₹{eachEvent.ticket_price}
            </p>

            <button
              type="button"
              className="book-btn"
              onClick={() =>
                bookTicket(eachEvent.id)
              }
            >
              Book Ticket
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}

export default Events