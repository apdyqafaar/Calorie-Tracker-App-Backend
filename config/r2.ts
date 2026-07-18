import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config"

const r2Client=new S3Client({
    region:"auto",
    endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials:{
        accessKeyId:process.env.R2_ACCESS_ID||"",
        secretAccessKey:process.env.R2_SECRET_KEY||"",
    }
})

export const r2Config={
    client:r2Client,
    bucketName:process.env.R2_BUCKET_NAME||"",
    publicUrl:process.env.R2_PUBLIC_DEVELOPMENT_URL||"",
}
