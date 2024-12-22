import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import path from "path"
import { connectDB } from "./src/lib/Db.js"
import authRoutes from "./src/routes/auth.route.js"
import messageRoutes from "./src/routes/message.route.js"
import cors from "cors"
import { app, server } from "./src/lib/socket.js";



dotenv.config();
const __dirname = path.resolve()

console.log(process.env.CLOUDINARY_API_SECRET)

app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow these HTTP methods
    allowedHeaders: "Content-Type, Authorization, X-Requested-With", // Allow these headers
}));

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

// Add this middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}



server.listen(PORT, () => {
    console.log(`Server is listening on port : ${PORT}`);
    connectDB();
}).on('error', (err) => {
    console.error(`Error starting server on port ${PORT}:`, err.message);
    if (err.code === 'EACCES') {
        console.error(`Port ${PORT} requires elevated privileges. Try a different port.`);
    } else if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
    }
});