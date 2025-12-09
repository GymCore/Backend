import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRouter from "./routes/auth";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "GymCore API działa" });
});

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    console.log("Baza gotowa");
  } catch (err) {
    console.error("Nie udało się połączyć z bazą:", err);

    if (process.env.ALLOW_START_WITHOUT_DB === "true") {
      console.warn("Startuję serwer bez połączenia z bazą (tryb awaryjny).");
    } else {
      process.exit(1);
    }
  }

  app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
};

start();
