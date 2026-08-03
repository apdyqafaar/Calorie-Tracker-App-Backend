import {z} from "zod"
import {OpenAI} from "openai"
import {zodResponseFormat} from "openai/helpers/zod"
const FoodAnalysisSchema=z.object({
    foodName:z.string().describe("The name of the food"),
    calorie:z.number().describe("The calorie of the food"),
    protein:z.number().describe("The protein of the food"),
    fat:z.number().describe("The fat of the food"),
    carbs:z.number().describe("The carbs of the food"),
    mealType:z.enum(["breakfast","lunch", "dinner","snack"]).describe("the meal type of the food")
})

export type foodAnalysis=z.infer<typeof FoodAnalysisSchema>

// openai setup
const openai=new OpenAI({
     apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1",
})
// const openai=new OpenAI({
//     apiKey:process.env.OPENAI_API_KEY!
// })

export const analyzeFood = async (image: string): Promise<foodAnalysis> => {
   try {
    if (!image)
      throw new Error(
        "OpenAI food analysis failed: No image provided. Please pass a valid image URL or base64 string to analyze."
      )

        const completion = await openai.chat.completions.parse({
            model: "openai/gpt-5.6-luna",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this food image and provide us nutrition. Make your best estimate for a typical serving size shown in image. Provide accurate nutritional values based on food visible in image."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: zodResponseFormat(FoodAnalysisSchema, "foodAnalysis"),
            max_completion_tokens: 5000,
            temperature: 0.1,
        })

        console.log("OpenAI model result:", JSON.stringify(completion.choices[0]))

        const message = completion.choices[0]?.message
        console.log("OpenAI response message:", JSON.stringify(message))
        if (message?.parsed) {
           return {
            carbs: message.parsed.carbs,
            calorie: message.parsed.calorie,
            fat: message.parsed.fat,
            foodName: message.parsed.foodName,
            mealType: message.parsed.mealType,
            protein: message.parsed.protein,
           }
        }
        if (message?.refusal) {
            throw new Error("OpenAI model refused to analyze the food image. The model may have safety restrictions or the content may be inappropriate for analysis.")
        }

            throw new Error("OpenAI food analysis failed: No structured response received from the model. The model may have returned invalid or incomplete data.")

   } catch (error) {
    console.error("OpenAI food analysis error:", error instanceof Error ? error.message : String(error))
        throw error
   }
}
