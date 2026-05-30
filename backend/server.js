import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"

const app = express()
app.use(express.static("public"))



const server = createServer(app)



app.get("/health", (req, res) => {
    res.status(200).json({ message: "Health check", success: true })
})

const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})