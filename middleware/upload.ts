import multer from "multer";
import { Request } from "express";
import path from "path";

let storage=multer.memoryStorage()

// file filter
const fileFilter=(req:Request, file:Express.Multer.File, cb:multer.FileFilterCallback):void=>{
    
    console.log("File type:", file.mimetype)
    const allowedTypes=/jpeg|jpg|png|gif|webp/
    const extname=allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mineType=allowedTypes.test(file.mimetype)

    if(extname&&mineType){
        return cb(null, true)
    }else{
           return cb(new Error("Invalid file type"))
    }
}

const upload=multer({
    storage:storage,
    limits:{
        fileSize:10*1024*1024
    },
    fileFilter,
})

export default upload