import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDb from "./config/db/db";
import { authRoutes ,food, report} from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 connectDb()
// Basic health check
app.get("/health", (req: Request, res: Response) => {
	res.json({ status: "ok", message: "Calorie Trucker App backend running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/food", food);
app.use("/api/v1/reports", report);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on port ${PORT}`);
});

export default app;
