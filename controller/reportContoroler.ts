import { Request, Response } from "express";
import User from "../lib/model/User";
import { getWeeklySummery } from "../lib/services/weekly-reports.service";
import { getDailySummery } from "../lib/services/daily-reports.service";
import { getMonthlySummery } from "../lib/services/monthly-reports.service";

// daily reports controller
export const getDailyReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    //  get user on db
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    const { date } = req.query;
    const targetDate =
      date && typeof date === "string" ? new Date(date) : new Date();

    const dailySummary = await getDailySummery(userId, targetDate);
    const remainingCalories =
      user.dailyCalorieGaol - dailySummary.totalCalories;
    const percentageOfGoal =
      (dailySummary.totalCalories / user.dailyCalorieGaol) * 100;

    return res.status(200).json({
      message: "Daily summary fetched successfully",
      data: {
        date: targetDate.toISOString().split("T")[0],
        goal: user.dailyCalorieGaol,
        consumed: dailySummary.totalCalories,
        remaining: remainingCalories > 0 ? remainingCalories : 0,
        percentage: percentageOfGoal,
        isOverGoal: dailySummary.totalCalories > user.dailyCalorieGaol,
        macros: dailySummary.macros,
        mealBreakdown: dailySummary.mealBreakdown,
        entriesCount:dailySummary.entries
      },
    });
  } catch (error) {
    console.log("Failed to process saving food", error);
    return res.status(500).json({
      message: "Failed to process saving food",
    });
  }
};

// weekly reports controller
export const getWeeklyReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    //  get user on db
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to the end of today
    // calculate the start of the week (7 days ago)
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0); // Set to the start of the week

    const weeklySummary = await getWeeklySummery(userId, weekAgo, today);

    // build 7 days summary
    const weeklySummaries: Array<{
      goal: number;
      fat: number;
      protein: number;
      carbs: number;
      calories: number;
      percentageComplete: number;
      entriesCount: number;
      date: string;
      dayName: string;
    }> = [];

    const todyUTCDate = today.toISOString().split("T")[0] ?? "";
    const parts = todyUTCDate.split("-").map(Number);

    if (parts.length !== 3) {
      throw new Error("Invalid date format");
    }

    const [year, month, day] = parts;
    const startDte = new Date(Date.UTC(year!, month! - 1, day! - 6));
    for(let i = 0; i < 7; i++) {
      const date=new Date(startDte);
      date.setDate(startDte.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = weeklySummary.dailyData[dateStr!] || { calories: 0, carbs: 0, fat: 0, protein: 0, count: 0 };

      weeklySummaries.push({
        date: dateStr||"",
        dayName: date.toLocaleDateString("en-US", { weekday: "short" , timeZone: "UTC" }),
        goal: user.dailyCalorieGaol,
        calories: dayData.calories,
       carbs: dayData.carbs,
        fat: dayData.fat,
        protein: dayData.protein,
        percentageComplete: (dayData.calories / user.dailyCalorieGaol) * 100,
        entriesCount: dayData.count,
      });
    }

    return res.status(200).json({
      message: "Weekly summary fetched successfully",
      data: {
        week:weeklySummaries,
        totalEntries: weeklySummary.totalEntries,
        totalCalories: weeklySummary.totalCalories,
        averageCalories: weeklySummary.averageCalories,
        goal: user.dailyCalorieGaol,
        macros: weeklySummary.macros,
      },
    });
  } catch (error) {
    console.log("Failed to process saving food", error);
    return res.status(500).json({
      message: "Failed to process saving food",
    });
  }
};

// weekly reports controller
export const getMonthlyReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    //  get user on db
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    const {monthReport}=req.query
     let monthAgo = new Date();
     let currentDate = new Date();
    if(monthReport&& typeof monthReport==="string"){
       monthAgo=new Date(monthReport)
       currentDate = new Date(monthReport);
       monthAgo.setHours(23, 59, 59, 999);
       currentDate.setHours(23, 59, 59, 999);
    }else{
    const today = new Date();
       today.setHours(23, 59, 59, 999);
       monthAgo=new Date(today)
       currentDate = new Date(today);
    }
   
    monthAgo.setDate(currentDate.getDate() - 29);
    monthAgo.setHours(0, 0, 0, 0); // Set to the start of the month
    console.log("monthAgo", monthAgo)

    const dailySummary = await getMonthlySummery(userId, monthAgo, currentDate);

    // build 7 days summary
    const monthlySummery: Array<{
      goal: number;
      day:number;
      fat: number;
      protein: number;
      carbs: number;
      calories: number;
      percentageComplete: number;
      entriesCount: number;
      date: string;
      dayName: string;
    }> = [];

    const todyUTCDate = currentDate.toISOString().split("T")[0] ?? "";
    const parts = todyUTCDate.split("-").map(Number);

    if (parts.length !== 3) {
      throw new Error("Invalid date format");
    }

    const [year, month, day] = parts;
    for(let i = 1; i <= 30; i++) {
      const date=new Date(monthAgo);
      date.setDate(monthAgo.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = dailySummary.monthlyData[dateStr!] || { calories: 0, carbs: 0, fat: 0, protein: 0, count: 0 };

      monthlySummery.push({
        date: dateStr||"",
        day:i,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" , timeZone: "UTC" }),
        goal: user.dailyCalorieGaol,
        calories: dayData.calories,
       carbs: dayData.carbs,
        fat: dayData.fat,
        protein: dayData.protein,
        percentageComplete: (dayData.calories / user.dailyCalorieGaol) * 100,
        entriesCount: dayData.count,
      });
    }

    return res.status(200).json({
      message: "Monthly summary fetched successfully",
      data: {
        monthly:monthlySummery,
        totalEntries: dailySummary.totalEntries,
        totalCalories: dailySummary.totalCalories,
        averageCalories: dailySummary.averageCalories,
        goal: user.dailyCalorieGaol,
        macros: dailySummary.macros,
      },
    });
  } catch (error) {
    console.log("Failed to read monthly report", error);
    return res.status(500).json({
      message: "Failed to read monthly report",
    });
  }
};

