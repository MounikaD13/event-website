const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { getGridFSBucket } = require("../utils/gridFs");

// @route   GET /api/images/:id
// @desc    Get an image by ID from GridFS
// @access  Public
router.get("/images/:id", async (req, res) => {
    try {
        const bucket = getGridFSBucket();

        let fileId;
        try {
            fileId = new mongoose.Types.ObjectId(req.params.id);
        } catch (err) {
            return res.status(400).json({ message: "Invalid image ID format" });
        }

        // Check if file exists first
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "Image not found" });
        }

        const file = files[0];
        // Set proper content type so the browser renders it as an image
        res.set("Content-Type", file.contentType || "image/jpeg");

        // Stream the file directly from MongoDB to the response
        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on("error", (error) => {
            console.error("GridFS download error:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: "Error downloading image" });
            }
        });

        downloadStream.pipe(res);

    } catch (error) {
        console.error("Error retrieving image:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to retrieve image" });
        }
    }
});

module.exports = router;