
import express from 'express';
import { protect } from '../middleware';
import { getDailyReports, getWeeklyReports,getMonthlyReports } from '../controller/reportContoroler';

const router=express.Router();
router.post("/daily", protect, getDailyReports)
router.post("/weekly", protect, getWeeklyReports)
router.post("/monthly", protect, getMonthlyReports)

export default router;

