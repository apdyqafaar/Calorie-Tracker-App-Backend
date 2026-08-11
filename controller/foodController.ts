import { Request, Response } from "express";
import { foodServices } from "../lib/services/foode.service";
import { deleteImage, uploadR2 } from "../lib/services/r2.service";
import { analyzeFood } from "../lib";
import Food from "../lib/model/food";
// scan food
export const scanFood = async (req: Request, res: Response) => {
 try {
   const file = req.file;
   const userId=req.user?.userId
    if(!userId){
         return res.status(401).json({
     message:"Unauthorized"
  })
    }
  if (!file) {
    return res
      .status(400)
      .json({ message: "Please upload file an image of the food" });
  }
  const image = file.buffer;

  //   optimize using sharp
  console.log("optimizing the image...");
  const optimizedImage = await foodServices.optimizeImageSize(image);

  // uploading on r2 cloude
  console.log("uploading the image...");
  const { key, ur:url } = await uploadR2(optimizedImage);
  console.log(`uploaded successfully key: ${key}`);

  // analyzing the food on openai model vision
  const analyzedFoodResult = await analyzeFood(url);
  console.log(`Analyzed food result: ${analyzedFoodResult}`);
  
  // saving to database
  const foodEntry=await Food.create({
    userId,
    foodName:analyzedFoodResult.foodName,
    carbs:analyzedFoodResult.carbs,
    calorie:analyzedFoodResult.calorie,
    fat:analyzedFoodResult.fat,
    protein:analyzedFoodResult.protein,
    mealType:analyzedFoodResult.mealType,
    imageUrl:url,
    storageKey:key
  })

  return res.status(201).json({
    message:"Food scanned successfully",
    food:foodEntry
  })
 } catch (error) {
  console.log("Failed to process scanning food", error)
  return res.status(500).json({
    message:"Failed to process scanning food",
    food:null
  })
 }
};

// analyze
export const analyze = async (req: Request, res: Response) => {
 try {
   const file = req.file;
   const userId=req.user?.userId
    if(!userId){
         return res.status(401).json({
     message:"Unauthorized"
  })
    }
  if (!file) {
    return res
      .status(400)
      .json({ message: "Please upload file an image of the food" });
  }
  const image = file.buffer;

  //   optimize using sharp
  console.log("optimizing the image...");
  const optimizedImage = await foodServices.optimizeImageSize(image);

  // uploading on r2 cloud
  console.log("uploading the image...");
  const { key, ur:url } = await uploadR2(optimizedImage);
  console.log(`uploaded successfully key: ${key}`);

  // analyzing the food on openai model vision
  const analyzedFoodResult = await analyzeFood(url);
  console.log(`Analyzed food result: ${analyzedFoodResult}`);

// convert the image to base64
const imageBase64=`data:image/jpeg;base64,${optimizedImage.toString()}`
 
  return res.status(201).json({
     ...analyzedFoodResult,
    message:"Food analyzed successfully",
    imageBase64,
    storageKey:key,
    imageUrl:url
  })
 } catch (error) {
  console.log("Failed to process analyzing food", error)
  return res.status(500).json({
    message:"Failed to process analyzing food",
    food:null
  })
 }
};


// save food
export const saveFood = async (req: Request, res: Response) => {
  try{
    const {foodName,calorie,protein,fat, carbs,imageUrl,storageKey,mealType}=req.body
    if(!foodName || !calorie||!fat ||!carbs ||!protein ||!imageUrl ||!storageKey){
       return res.status(401).json({
     message:"All food info are required"
  })
    }
    const userId=req.user?.userId
    if(!userId){
         return res.status(401).json({
     message:"Unauthorized"
  })
    }

  await Food.create({
    userId,
    foodName,
    protein,
    calorie,
    fat,
    carbs,
    imageUrl,
    storageKey,
    mealType:mealType||"other"
  })
  return res.status(201).json({
    message:"Successfully saved your food",
  })
  } catch (error) {
  console.log("Failed to process saving food", error)
  return res.status(500).json({
    message:"Failed to process saving food",
  })
 }
};

// discard food
export const discardFood = async (req: Request, res: Response) => {
  try{
    const {storageKey}=req.body
    console.log("storageKey", storageKey)
    if(!storageKey){
       return res.status(401).json({
     message:"StorageKey is required"
  })
    }
    const userId=req.user?.userId
    if(!userId){
         return res.status(401).json({
     message:"Unauthorized"
  })
    }

    await deleteImage(storageKey)
 return res.status(201).json({
    message:"Successfully discarded your food",
  })
  
  } catch (error) {
  console.log("Internal server error for deleting image on R2", error)
  return res.status(500).json({
    message:"Failed to process saving food",
  })
 }
};
// Entries food
export const getEntries = async (req: Request, res: Response) => {
  try{
    const userId=req.user?.userId
    if(!userId){
         return res.status(401).json({
     message:"Unauthorized"
  })
    }

    const {date, startDate, endDate, limit="50", page="1"}=req.query
// 1. Parse & validate pagination
const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
const parsedPage = Math.max(Number(page) || 1, 1);
const offset = (parsedPage - 1) * parsedLimit;

const query: Record<string, any> = { userId };

// Helper to validate and create start/end UTC day bounds
const createDayBounds = (startStr: string, endStr?: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr || startStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  // Set UTC bounds to avoid local server timezone skew
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  return { $gte: start, $lte: end };
};

// 2. Build date query safely
if (typeof date === "string") {
  const bounds = createDayBounds(date);
  if (!bounds) return res.status(400).json({ message: "Invalid date format" });
  query.timestamp = bounds;
} else if (typeof startDate === "string" && typeof endDate === "string") {
  const bounds = createDayBounds(startDate, endDate);
  if (!bounds) return res.status(400).json({ message: "Invalid startDate or endDate format" });
  query.timestamp = bounds;
} else if (startDate || endDate) {
  return res.status(400).json({ message: "Both startDate and endDate are required when querying a range" });
} else {
  // Default to today (UTC)
  const today = new Date();
  query.timestamp = createDayBounds(today.toISOString())!;
}

console.log("query: ", query)
// 3. Execute DB Queries
const [entries, totalEntries] = await Promise.all([
  Food.find(query)
    .sort({ timestamp: -1 }) // Match sort field with filter field
    .limit(parsedLimit)
    .skip(offset)
    .lean(), // Added lean() for read performance
  Food.countDocuments(query),
]);
console.log("entries: ", entries)
 
    const totalPages=Math.ceil(totalEntries/parsedLimit)
    return res.status(200).json({
      message:"Successfully fetched your food entries",
      timeZone:(startDate&&endDate)?"Based on your timeZone":"Based on server timeZone",
      entries,
      pagination:{
        currentPage:parsedPage,
        totalPages,
        totalEntries,
        limit:parsedLimit,
        hasNextPage:parsedPage<totalPages,
        hasPrevPage:parsedPage>1
      }
    })
  
  } catch (error) {
   console.error("Internal server error while fetching food entries", error);

return res.status(500).json({
  message: "Failed to fetch food entries",
});
 }
};



