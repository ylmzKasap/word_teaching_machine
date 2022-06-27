const aws = require('aws-sdk');
const fs = require('fs');

const upload_file = async (fileType, fileName, filePath) => {
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const dotSplit = filePath.split('.');
    const extension = dotSplit[dotSplit.length - 1];
    const dir = fileType === 'image' ? 'images' : 'sounds';
    
    const blob = fs.readFileSync(filePath);

    const uploadedFile = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${dir}/${fileName}_${Date.now()}.${extension}`,
        Body: blob,
    }).promise().catch(err => {throw err;});

    return uploadedFile.Location;
}

const generate_url = () => {
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: "sounds/square_1656083522943.mp3",
        Expires: 20
    });
    return url;
}

module.exports = {
    upload_file, generate_url
}
