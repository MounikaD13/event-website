const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

let gfsBucket;

const initGridFS = () => {
    gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "images" // Or whatever name you prefer, e.g. "uploads"
    });
    console.log("GridFS initialized for images");
};

const getGridFSBucket = () => {
    if (!gfsBucket) {
        throw new Error("GridFSBucket not initialized");
    }
    return gfsBucket;
};

const uploadImageStream = (fileBuffer, filename, mimetype) => {
    return new Promise((resolve, reject) => {
        if (!gfsBucket) {
            return reject(new Error("GridFS not initialized"));
        }

        // Create readable stream from memory buffer
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);

        const uploadStream = gfsBucket.openUploadStream(filename, {
            contentType: mimetype
        });

        readableStream.pipe(uploadStream)
            .on("error", (error) => {
                reject(error);
            })
            .on("finish", () => {
                resolve({
                    id: uploadStream.id,
                    filename: filename
                });
            });
    });
};

const deleteImage = (fileId) => {
    return new Promise((resolve, reject) => {
        if (!gfsBucket) {
            return reject(new Error("GridFS not initialized"));
        }

        let id;
        try {
            id = new mongoose.Types.ObjectId(fileId);
        } catch (err) {
            return reject(new Error("Invalid image ID format"));
        }

        gfsBucket.delete(id, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

module.exports = {
    initGridFS,
    getGridFSBucket,
    uploadImageStream,
    deleteImage
};
