import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { generateUniqueId } from "./id_generator.service"
import { r2Config } from "../../config/r2"

export const uploadR2=async(buffer:Buffer):Promise<{ur:string, key:string}>=>{
  const key=generateUniqueId("key")

  try {
    // upload img
    const command=new PutObjectCommand({
        Bucket:r2Config.bucketName,
        Key:key,
        Body:buffer,
        ContentType:"image/jpeg"
    })
    const response=await r2Config.client.send(command)
    console.log("Uploaded file on r2 s3 storage")
    return{
    key,
    ur:`${r2Config.publicUrl}/${key}`
    }
  } catch (error) {
    console.log("Failed to upload the image on r2 s3 storage", error)
     throw new Error("Failed to upload the image on r2 s3 storage")
  }
}

// delete file on r2
export const deleteImage=async(storageKey:string):Promise<void>=>{
  const key=storageKey

  try {
    // upload img
    const command=new DeleteObjectCommand({
        Bucket:r2Config.bucketName,
        Key:key,
    })
   await r2Config.client.send(command)
    console.log("Image was deleted from R2 successfully")
  } catch (error) {
    console.log("Failed to deleted from R2 successfully", error)
     throw new Error("Failed to deleted from R2 successfully")
  }
}