import { Types } from "mongoose";
import { IDailySummary, IMealStats, IOverallStats } from "../types";
import Food from "../model/food";

export const getDailySummery = async (
  userId: string | Types.ObjectId,
  date: Date = new Date(),
): Promise<IDailySummary> => {
  //   configuring the start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  //    validate userId
  const userIdObj =typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  // aggregate the daily summary
  const [result] = await Food.aggregate<{mealStats: IMealStats[], overallStats: IOverallStats[]}>([
    {
      $match: {
        userId: userIdObj,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
        $facet: {
            mealStats:[
                {
                    $group:{
                        _id:"$mealType",
                        totalCalories:{$sum:"$calorie"},
                        totalProtein:{$sum:"$protein"},
                        totalCarbs:{$sum:"$carbs"},
                        totalFat:{$sum:"$fat"},
                        totalEntries:{$sum:1},
                    }
                }
            ],
            // overallStats:
            overallStats:[
                {
                    $group:{
                        _id:null,
                        totalCalories:{$sum:"$calorie"},
                        totalProtein:{$sum:"protein"},
                        totalCarbs:{$sum:"$carbs"},
                        totalFat:{$sum:"$fat"},
                        totalEntries:{$sum:1},
                    }
                }
            ]
        }
    }
  ]);

  // console.log("result: daily reports: ", JSON.stringify(result))
  // console.log("Daily Summary Result:", result);
   const initialDailySummary = {
  date: new Date(0),

  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,

  mealBreakdown: {
    breakfast: {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      count: 0,
    },
    lunch: {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      count: 0,
    },
    dinner: {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      count: 0,
    },
    snack: {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      count: 0,
    },
  },

  macros: {
    protein: {
      grams: 0,
      calories: 0,
      percentage: 0,
    },
    carbs: {
      grams: 0,
      calories: 0,
      percentage: 0,
    },
    fat: {
      grams: 0,
      calories: 0,
      percentage: 0,
    },
  },

  entries: 0,
};

  if(result  && result.overallStats && result.overallStats.length > 0) {
    const overallStats = result.overallStats[0];
    initialDailySummary.totalCalories = overallStats?.totalCalories||0;
    initialDailySummary.totalProtein = overallStats?.totalProtein||0;
    initialDailySummary.totalCarbs = overallStats?.totalCarbs||0;
    initialDailySummary.totalFat = overallStats?.totalFat||0;
    initialDailySummary.entries = overallStats?.totalEntries||0;
  
  }


//  Populate meal breakdown
  if(result  && result.mealStats && result.mealStats.length > 0) {
     result.mealStats.forEach((meal: any) => {
     
        const mealType = meal._id as  keyof IDailySummary["mealBreakdown"];
        if(initialDailySummary.mealBreakdown[mealType]){
            initialDailySummary.mealBreakdown[mealType] = {
                calories: meal.totalCalories||0,
                carbs: meal.totalCarbs||0,
                fat: meal.totalFat||0,
                protein: meal.totalProtein||0,
                count: meal.totalEntries||0
            }
        }

          console.log("meal:", meal)
        // calculating macros
        const caloriesFromProtein = meal.totalProtein * 4;
        const caloriesFromCarbs = meal.totalCarbs * 4;
        const caloriesFromFat = meal.totalFat * 9;

        const totalMacrosCalories = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;

        initialDailySummary.macros={
          carbs:{
            grams: initialDailySummary.totalCarbs||0,
            calories: caloriesFromCarbs||0,
            percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromCarbs / totalMacrosCalories) * 100) : 0,
          },
          protein:{
            grams: initialDailySummary.totalProtein||0,
            calories: caloriesFromProtein||0,
            percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromProtein / totalMacrosCalories) * 100) : 0,
          },
          fat:{
            grams: initialDailySummary.totalFat||0,
            calories: caloriesFromFat||0,
            percentage: totalMacrosCalories > 0 ? Math.round((caloriesFromFat / totalMacrosCalories) * 100) : 0,
          }
        }
  })
  }

  return initialDailySummary;
 
}
