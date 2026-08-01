import {useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import api from "../../api"

const EventDetails = () => {

  const [event, setEvent] = useState(null)

  const {eventId} = useParams()

  useEffect(() => {
    getEventDetails()
  }, [])

  const getEventDetails = async () => {

    const response = await api.get(
      `/api/events/${eventId}`
    )

    setEvent(response.data)
  }

  if (event === null) {
    return <h1>Loading...</h1>
  }

  return (
    <div>

      <h1>{event.title}</h1>

      <p>{event.description}</p>

      <p>{event.category}</p>

      <p>{event.location}</p>

      <p>{event.event_date}</p>

      <p>{event.event_time}</p>

      <p>{event.available_seats}</p>

      <p>{event.ticket_price}</p>

    </div>
  )
}

export default EventDetails