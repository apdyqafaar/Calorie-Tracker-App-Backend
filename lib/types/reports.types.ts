export interface IDailySummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;

  mealBreakdown: {
    breakfast: {
      calories: number;
      carbs: number;
      fat: number;
      protein: number;
      count: number;
    };
    lunch: {
        calories: number;
      carbs: number;
      fat: number;
      protein: number;
      count: number;
    };
    dinner: {
        calories: number;
      carbs: number;
      fat: number;
      protein: number;
      count: number;
    };
    snack: {
        calories: number;
      carbs: number;
      fat: number;
      protein: number;
      count: number;
    };
  };

  macros: {
    protein: {
      grams: number;
      calories: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      calories: number;
      percentage: number;
    };
    fat: {
      grams: number;
      calories: number;
      percentage: number;
    };
  };

  entries: number;
}
export interface IOverallStats {
 _id: null;
 totalCalories: number;
 totalProtein: number;
 totalCarbs: number;
 totalFat: number;
 totalEntries: number;
}

export interface IMealStats {
 _id: string;
 fat: number;
 calories: number;
 protein: number;
 carbs: number;
 count: number;
}

// weekly summary interface
export interface IWeeklySummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  averageCalories: number;
  totalEntries: number;
    dailyData: Record<string, {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    count: number;
  }>;

  macros: {
    protein: {
      grams: number;
      calories: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      calories: number;
      percentage: number;
    };
    fat: {
      grams: number;
      calories: number;
      percentage: number;
    };
  };
}