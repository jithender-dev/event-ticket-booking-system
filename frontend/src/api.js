import axios from "axios"

const api = axios.create({
  baseURL: "https://event-ticket-booking-system-zbd5.onrender.com",
})

export default api  