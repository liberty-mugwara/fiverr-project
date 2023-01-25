import "./dotenv-config.js";

import { authRouter, jobsRouter, usersRouter } from "./routes/index.js";
import {
  handle404,
  handleHttpErrors,
  setAuthContext,
} from "./middleware/index.js";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import logger from "morgan";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(logger("dev"));

// authentication
app.use(setAuthContext);

// Routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/jobs", jobsRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(handleHttpErrors);

app.use(handle404);

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
