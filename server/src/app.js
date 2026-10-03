import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     next();
// });

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    console.log(req.body);
    res.send("server is running...");
});


// import verifyProtectedRoutes from "./routes/verifyProtected.routes.js";
// app.use("/api", verifyProtectedRoutes);

// import adminRouter from "./routes/admin.routes.js";
// app.use("/api/admin", adminRouter);

import userRouter from "./routes/users.routes.js";
app.use("/api/user", userRouter);

import messageRouter from "./routes/messages.routes.js";
app.use("/api/messages", messageRouter);

import feedbackRouter from "./routes/feedback.routes.js";
app.use("/api/feedback", feedbackRouter);


app.use((req, res, next) => {
    const error = new Error(
        `Cant find the ${req.originalUrl} on the server`
    );

    error.statusCode = 404;
    error.status = "fail";

    next(error);
});

app.use((err, req, res, next) => {
    if (err.isJoi === true) {
        err.statusCode = 422;
    }

    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || "Internal Server Error",
    });
});

export { app };
