// import AWS from "aws-sdk";
import crypto from "crypto";
import S3 from "aws-sdk/clients/s3";

import { Request, Response, NextFunction } from "express";
import { S3_CONTENT_BUCKET, S3_CONTENT_LINK_EXPIRATION } from "config/settings";
import { AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET } from "config/secrets";

const s3 = new S3({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_ACCESS_KEY_SECRET
    }
});

interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

interface Document {
    url: string;
    key: string;
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const result = {
            Data: new Array<Document>()
        };

        for (let file of (req.files as File[])) {
            var hash = crypto.createHash("md5").update(file.buffer).digest("hex");
            const key = `${req.user.sub}/${hash}`;
            await s3.putObject({
                Body: file.buffer,
                Bucket: S3_CONTENT_BUCKET,
                Key: key,
                ContentType: file.mimetype
            }).promise();

            result.Data.push({
                url: s3.getSignedUrl("getObject", {
                    Bucket: S3_CONTENT_BUCKET,
                    Key: key,
                    Expires: S3_CONTENT_LINK_EXPIRATION
                }),
                key: key
            });
        }

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};