const express = require("express")
const path = require("path")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const QRCode = require("qrcode")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const fs = require("fs")

const PORT = 5000
const SECRET_KEY = "MY_SECRET_TOKEN"

const dbPath = path.join(__dirname, "database", "eventManager.db")
const schemaPath = path.join(__dirname, "database", "schema.sql")

const app = express()  

app.use(express.json())
app.use(cors())

let db = null

const initializeDBAndServer = async () => {
  try {
     
    db = await open({
      filename: dbPath,  
      driver: sqlite3.Database,
    })

    const schema = fs.readFileSync(schemaPath, "utf8")

    await db.exec(schema)

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`)
    })

  } catch (e) {

    console.log(`DB Error: ${e.message}`)
    process.exit(-1)
  }
}

initializeDBAndServer()

/*AUTHENTICATION MIDDLEWARE*/

const authenticateToken = (request, response, next) => {

  const authHeader = request.headers["authorization"]

  let jwtToken

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1]
  }

  if (jwtToken === undefined) {

    response.status(401)
    response.send("Invalid Access Token")

  } else {

    jwt.verify(
      jwtToken,
      SECRET_KEY,
      async (error, payload) => {

        if (error) {
          response.status(401)
          response.send("Invalid Access Token")
        } else {
          request.userId = payload.id
          request.role = payload.role
          next()
        }
      }
    )
  }
}

/*HOME API*/

app.get("/", (request, response) => {
  response.send("Smart Event Management Backend Running")
})


/*REGISTER API*/

app.post("/api/auth/register", async (request, response) => {

  const {name, email, password, role} = request.body

  const selectUserQuery = `
    SELECT *
    FROM users
    WHERE email='${email}';
  ` 

  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {

    const hashedPassword = await bcrypt.hash(password, 10)

    const createUserQuery = `
      INSERT INTO users(
        name,
        email,
        password,
        role
      )
      VALUES(
        '${name}',
        '${email}',
        '${hashedPassword}',
        '${role}'
      );
    `

    await db.run(createUserQuery)

    response.send("User Created Successfully")

  } else {

    response.status(400)
    response.send("User Already Exists")
  }
})

/*LOGIN API*/

app.post("/api/auth/login", async (request, response) => {

  const {email, password} = request.body

  const selectUserQuery = `
    SELECT *
    FROM users
    WHERE email='${email}';
  `

  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {

    response.status(400)
    response.send("Invalid User") 

  } else {

    const isPasswordMatched = await bcrypt.compare(
      password,
      dbUser.password
    )

    if (isPasswordMatched === true) {

      const payload = {
        id: dbUser.id,
        role: dbUser.role,
      }

      const jwtToken = jwt.sign(
        payload,
        SECRET_KEY
      )

      response.send({jwtToken})

    } else {

      response.status(400)
      response.send("Invalid Password")
    }
  }
})



app.post(
  "/api/events",
  authenticateToken,
  async (request, response) => {

    const {
      title,
      description,
      category,
      location,
      event_date,
      event_time,
      capacity,
      ticket_price,
    } = request.body

    const createEventQuery = `
      INSERT INTO events(
        title,
        description,
        category,
        location,
        event_date,
        event_time,
        capacity,
        available_seats,
        ticket_price,
        organizer_id
      )
      VALUES(
        '${title}',
        '${description}',
        '${category}',
        '${location}',
        '${event_date}',
        '${event_time}',
        ${capacity},
        ${capacity},
        ${ticket_price},
        ${request.userId}
      );
    `

    await db.run(createEventQuery)

    response.send("Event Created Successfully")
  }
)


app.get("/api/events", async (request, response) => {

  const getEventsQuery = `
    SELECT *
    FROM events
    ORDER BY created_at DESC;
  `

  const eventsList = await db.all(getEventsQuery)

  response.send(eventsList)
})



app.get("/api/events/:eventId", async (request, response) => {

  const {eventId} = request.params

  const getEventQuery = `
    SELECT *
    FROM events
    WHERE id = ${eventId};
  `

  const event = await db.get(getEventQuery)

  if (event === undefined) {
    response.status(404)
    response.send("Event Not Found")
  } else {
    response.send(event)
  }
})



/*BOOK TICKET API*/


app.post("/api/book-ticket",authenticateToken,async (request, response) => {

    const {eventId} = request.body

    const getEventQuery = `
      SELECT *
      FROM events
      WHERE id = ${eventId};
    `

    const event = await db.get(getEventQuery)

    if (event === undefined) {
      response.status(404)
      response.send("Event Not Found")
      return
    }

    if (event.available_seats <= 0) {
      response.status(400)
      response.send("Event Full")
      return
    }

    const checkBookingQuery = `
      SELECT *
      FROM tickets
      WHERE user_id = ${request.userId}
      AND event_id = ${eventId};
    `

    const existingBooking = await db.get(checkBookingQuery)

    if (existingBooking !== undefined) {
      response.status(400)
      response.send("Duplicate Booking Not Allowed")
      return  
    }

    const ticketCode = `TICKET_${Date.now()}`

const qrCodeImage = await QRCode.toDataURL(
  ticketCode
)

const createTicketQuery = `
  INSERT INTO tickets(
    user_id,
    event_id,
    ticket_code,
    qr_code
  )
  VALUES(
    ${request.userId},
    ${eventId},
    '${ticketCode}',
    '${qrCodeImage}'
  );
`

await db.run(createTicketQuery)
const updateSeatsQuery = `
  UPDATE events
  SET available_seats = available_seats - 1
  WHERE id = ${eventId};
`

await db.run(updateSeatsQuery)

    response.send({
      message: "Ticket Booked Successfully",
      ticketCode,
    })
  }
)

/*GET MY TICKETS API*/

app.get("/api/tickets",authenticateToken,async (request, response) => {

    const getTicketsQuery = `
  SELECT
    tickets.id,
    tickets.ticket_code,
    tickets.qr_code,
    events.title
  FROM tickets
  INNER JOIN events
  ON tickets.event_id = events.id
  WHERE tickets.user_id = ${request.userId};
`

    const tickets = await db.all(getTicketsQuery)

    response.send(tickets)
  }
)


app.get("/api/profile",authenticateToken,async (request, response) => {

    const getUserQuery = `
      SELECT
        id,
        name,
        email,
        role,
        created_at
      FROM users
      WHERE id = ${request.userId};
    `

    const user = await db.get(getUserQuery)

    response.send(user)
  }
)

app.get("/api/events/:eventId/attendees",authenticateToken,async (request, response) => {

    const {eventId} = request.params

    const getAttendeesQuery = `
      SELECT
        users.id,
        users.name,
        users.email
      FROM tickets
      INNER JOIN users
      ON tickets.user_id = users.id
      WHERE tickets.event_id = ${eventId};
    `

    const attendees = await db.all(getAttendeesQuery)

    response.send(attendees)
  }
)

app.put("/api/events/:eventId",authenticateToken,async (request, response) => {

    const {eventId} = request.params

    const {
      title,
      description,
      category,
      location,
      event_date,
      event_time,
      capacity,
      ticket_price,
      
    } = request.body

    const updateEventQuery = `
      UPDATE events
      SET
        title='${title}',
        description='${description}',
        category='${category}',
        location='${location}',
        event_date='${event_date}',
        event_time='${event_time}',
        capacity=${capacity},
        ticket_price=${ticket_price}
        
      WHERE id=${eventId};
    `

    await db.run(updateEventQuery)

    response.send("Event Updated Successfully")
  }
)

app.delete("/api/events/:eventId",authenticateToken,
  async (request, response) => {

    const {eventId} = request.params

    const deleteEventQuery = `
      DELETE FROM events
      WHERE id=${eventId};
    `

    await db.run(deleteEventQuery)

    response.send("Event Deleted Successfully")
  }
)

app.post("/api/notifications",authenticateToken,async (request, response) => {

    const {userId, message} = request.body

    const createNotificationQuery = `
      INSERT INTO notifications(
        user_id,
        message
      )
      VALUES(
        ${userId},
        '${message}'
      );
    `

    await db.run(createNotificationQuery)

    response.send("Notification Created Successfully")
  }
)

app.get("/api/notifications",authenticateToken,async (request, response) => {

    const getNotificationsQuery = `
      SELECT *
      FROM notifications
      WHERE user_id=${request.userId}
      ORDER BY created_at DESC;
    `

    const notifications = await db.all(getNotificationsQuery)

    response.send(notifications)
  }
)



app.put(
  "/api/change-password",
  authenticateToken,
  async (request, response) => {

    const {oldPassword, newPassword} = request.body

    const getUserQuery = `
      SELECT *
      FROM users
      WHERE id = ${request.userId};
    `

    const dbUser = await db.get(getUserQuery)

    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      dbUser.password
    )

    if (!isPasswordMatched) {
      response.status(400)
      response.send("Old Password is Incorrect")
      return
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    )

    const updatePasswordQuery = `
      UPDATE users
      SET password='${hashedPassword}'
      WHERE id=${request.userId};
    `

    await db.run(updatePasswordQuery)

    response.send("Password Updated Successfully")
  }
)

app.get("/check-tickets-schema", async (request, response) => {
  const result = await db.all(`
    PRAGMA table_info(tickets);
  `)

  response.send(result)
})