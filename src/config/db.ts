import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Brak MONGODB_URI w pliku .env");
  }

  try {
    await mongoose.connect(uri);
    console.log("Połączono z MongoDB");
  } catch (error) {
    console.error("Błąd łączenia z MongoDB:", (error as Error).message);
    throw error;
  }
};
