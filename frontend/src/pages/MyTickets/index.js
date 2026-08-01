import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import api from "../../api"
import "./index.css"

const MyTickets = () => {

  const [ticketsList, setTicketsList] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getTickets()
  }, [])

  const getTickets = async () => {

    const jwtToken = localStorage.getItem(
      "jwt_token"
    )

    try {

      const response = await api.get(
        "/api/tickets",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )

      console.log(response.data)

      setTicketsList(response.data)

    } catch (error) {

      console.log(error)

      alert("Failed To Fetch Tickets")
    }
  }

  return (
    <div className="tickets-container">

      <button
        type="button"
        className="back-btn"
        onClick={() => navigate("/events")}
      >
        Back To Events
      </button>

      <h1 className="ticket-heading">
        My Tickets
      </h1>

      {ticketsList.length === 0 ? (
        <h3>No Tickets Booked Yet</h3>
      ) : (
        ticketsList.map(eachTicket => (
          <div
            className="ticket-card"
            key={eachTicket.id}
          >

            <h2>
              {eachTicket.title}
            </h2>

            <p>
              <strong>Ticket Code:</strong>{" "}
              {eachTicket.ticket_code}
            </p>

            <img
              src={eachTicket.qr_code}
              alt="qr code"
              width="150"
            />

          </div>
        ))
      )}

    </div>
  )
}

export default MyTickets 