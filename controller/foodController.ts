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



