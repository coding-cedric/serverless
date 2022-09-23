import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly s3bucket:string = process.env.ATTACHMENT_S3_BUCKET,
        private readonly expiration_time:string = process.env.SIGNED_URL_EXPIRATION
    ){}

    async generateUploadUrl(userId:string, todoId:string): Promise<string>{
        const s3 = new XAWS.S3({
            signatureVersion: 'v4'
        })

        const url:string = await s3.getSignedUrl('putObject', {
            Bucket: this.s3bucket,
            Key: `${userId}-${todoId}-dev`,
            Expires: parseInt(this.expiration_time)
        })

        return url
    }
}