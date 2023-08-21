const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const Transform = require("stream").Transform;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const parsefile = async (req) => {
  let filename = req.headers["x-filename"];

  return new Promise((resolve, reject) => {
    const fileStream = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk);
      },
    });

    req.on("data", (chunk) => {
      fileStream.write(chunk);
    });

    req.on("end", () => {
      fileStream.end();

      // upload to S3
      new Upload({
        client: new S3Client({
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          region,
        }),
        params: {
          ACL: "public-read",
          Bucket,
          Key: `${Date.now().toString()}-${filename}`, // Adjust filename as needed
          Body: fileStream,
        },
      })
        .done()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    req.on("error", (error) => {
      reject(error.message);
    });
  });
};

module.exports = parsefile;
