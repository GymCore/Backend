import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email i hasło są wymagane" });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Użytkownik już istnieje" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, name });

    return res.status(201).json({
      message: "Użytkownik utworzony",
      user: { id: user._id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email i hasło są wymagane" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    return res.json({
      message: "Zalogowano",
      user: { id: user._id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
});

export default router;
