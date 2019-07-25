import express from "express";

const app = express();

app.set("port", process.env.PORT || 3000);

app.get("/", (_req, res): void   => {
    res.sendStatus(200);
});

export default app;
