import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "GymCore API działa" });
});

app.post("/api/auth/sign-up", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/sign-in", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
