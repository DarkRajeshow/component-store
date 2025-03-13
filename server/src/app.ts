import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDB } from "./config/db";
import { corsOptions } from "./utils/corsOptions";
import { errorHandler } from "./middleware/errorHandler";
import V1Routes from "./routes/v1.routes";
import userRoutes from './routes/user.routes'
import designRoutes from './routes/design.routes'

dotenv.config();
const app = express();

// no need to set __dirname as it already existed in commonJS
const server_dirname = path.resolve();

console.log(server_dirname);

// Middleware
const whitelist = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
console.log('Allowed origins:', whitelist);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(server_dirname, "public")));
app.use("/api/uploads", express.static("public/uploads"));



app.get("/", (req, res) => {
    res.send("working")
})

// app.use('/api/users', userRoutes);
// app.use('/api/designs', designRoutes);
// // Routes
// app.use("/api/v1", V1Routes);
app.use("/api", V1Routes);
// app.use("/api/designs", DesignRoutes);

// Error handler
app.use(errorHandler);

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello Guys chay pi lo...",
    });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1); // Exit process with failure
    }
};

startServer();