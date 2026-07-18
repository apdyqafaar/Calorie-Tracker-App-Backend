import { Types } from "mongoose";
import { IWeeklySummary, } from "../types";
import Food from "../model/food";

// aggregate result interface
interface IAggregateResult {
  dailyStats: { _id: string; calories: number; carbs: number; fat: number; protein: number; count: number }[];
  overallStats: { totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; totalEntries: number }[];
}

export const getWeeklySummery = async (
  userId: string | Types.ObjectId,
  startOfDay: Date = new Date(),
  endOfDay: Date = new Date(),
): Promise<IWeeklySummary> => {

  //    validate userId
  const userIdObj =typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  // aggregate the weekly summary
  const [result] = await Food.aggregate<IAggregateResult>([
    {
      $match: {
        userId: userIdObj,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
        $facet: {
            dailyStats:[
                {
                    $group:{
                        _id:{$dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                        calories:{$sum:"$calories"},
                        protein:{$sum:"$protein"},
                        carbs:{$sum:"$carbs"},
                        fat:{$sum:"$fat"},
                        count:{$sum:1},
                    }
                },{
                  $sort: { _id: 1 }
                }
            ],
            // overallStats:
            overallStats:[
                {
                    $group:{
                        _id:null,
                        totalCalories:{$sum:"$calories"},
                        totalProtein:{$sum:"$protein"},
                        totalCarbs:{$sum:"$carbs"},
                        totalFat:{$sum:"$fat"},
                        totalEntries:{$sum:1},
                    }
                }
            ]
        }
    }
  ]);

  console.log("Weekly Summary Result:", result);
 
  // transform the result into the desired format
  const dailyData: Record<string, { calories: number; carbs: number; fat: number; protein: number; count: number }> = {};

  result?.dailyStats.forEach((day) => {
    dailyData[day._id] = {
      calories: day.calories||0,
      carbs: day.carbs||0,
      fat: day.fat||0,
      protein: day.protein||0,
      count: day.count||0,
    };
  });
 
  // overall stats
  const overallStats = result?.overallStats[0] || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalEntries: 0,
  };

  // calculate the marcos
  const caloriesFromProtein = overallStats.totalProtein * 4;
  const caloriesFromCarbs = overallStats.totalCarbs * 4;
  const caloriesFromFat = overallStats.totalFat * 9;
  const totalMacrosCalories = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;

  return{
    date: new Date(),
    dailyData,
    totalProtein: overallStats.totalProtein,
    totalCarbs: overallStats.totalCarbs,
    totalFat: overallStats.totalFat,
    totalCalories: overallStats.totalCalories,
    averageCalories: overallStats.totalEntries > 0 ? Math.round(overallStats.totalCalories / overallStats.totalEntries ): 0,
    totalEntries: overallStats.totalEntries,
    macros:{
      carbs:{
        grams: overallStats.totalCarbs,
        calories: caloriesFromCarbs,
        percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromCarbs / totalMacrosCalories) * 100) : 0,
      },
      protein:{
        grams: overallStats.totalProtein,
        calories: caloriesFromProtein,
        percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromProtein / totalMacrosCalories) * 100) : 0,
      },
      fat:{
        grams: overallStats.totalFat,
        calories: caloriesFromFat,
        percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromFat / totalMacrosCalories) * 100) : 0,
      }
    }

  }

}
