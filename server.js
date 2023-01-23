import "./dotenv-config.js";

import {
  handle404,
  handleHttpErrors,
  setAuthContext,
} from "./middleware/index.js";

import { authRouter } from "./routes/auth.js";
import express from "express";
import helmet from "helmet";
import logger from "morgan";
import { usersRouter } from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(logger("dev"));

// authentication
app.use(setAuthContext);

// Routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(handleHttpErrors);

app.use(handle404);

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
