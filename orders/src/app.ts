import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@rsticket/common";

import { createOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes";
import { deleteOrderRouter } from "./routes/delete";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // disable encryption on cookies
    secure: process.env.NODE_ENV !== "test", // enable HTTPS // ! False for test, True otherwise
  })
);

app.use(currentUser);

app.use(createOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
