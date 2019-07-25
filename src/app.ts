import express from "express";

const app = express();

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => res.sendStatus(200))

export default app;

