
import express from 'express';
import { protect } from '../middleware';
import { getDailyReports, getWeeklyReports,getMonthlyReports } from '../controller/reportContoroler';

const router=express.Router();
router.get("/daily", protect, getDailyReports)
router.get("/weekly", protect, getWeeklyReports)
router.get("/monthly", protect, getMonthlyReports)

export default router;

