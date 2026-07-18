import sharp from "sharp";

export class FoodServices {
  optimizeImageSize=async(buffer:Buffer):Promise<Buffer>=>{
    const originalLength=buffer.length
    const optimizedBuffer=await sharp(buffer)
    .rotate()
    .resize(1024, 1024,{
        fit:"inside",
        withoutEnlargement:true
    })
    .jpeg({
        mozjpeg:true,
        quality:85
    })
    .toBuffer()

    return optimizedBuffer
  }

}

export const foodServices = new FoodServices();