import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDb from "./config/db/db";
import { authRoutes ,food, report} from "./routes";

const app = express();

app.use(cors());
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ extended: true }));
 connectDb()
// Basic health check
app.get("/health", (req: Request, res: Response) => {
	res.json({ status: "ok", message: "Calorie Trucker App backend running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/food", food);
app.use("/api/v1/reports", report);


// error handling
app.use((err:Error, req:Request, res:Response, next:NextFunction)=>{
	console.log(err.stack)
	res.status(500).json({message:"Internal server Error"})
})

// NotFound
app.use(( req:Request, res:Response, next:NextFunction)=>{
	res.status(400).json({message:"Route not Found"})
})
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on port ${PORT}`);
});

export default app;
