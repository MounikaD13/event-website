const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const authMiddleware = require("../middleware/middleware");
const multer = require("multer");
const { uploadImageStream, deleteImage } = require("../utils/GridFs");

// Set up Multer for memory storage
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// @route   POST /api/events
// @desc    Create an event
// @access  Admin (Planner) only
router.post("/events", authMiddleware(["admin"]), upload.array("images", 10), async (req, res) => {
    try {
        const { title, description, category, price, totalTickets } = req.body;
        if (!title || !description || !category || !price || !totalTickets) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    const uploadedFile = await uploadImageStream(file.buffer, file.originalname, file.mimetype);
                    imageUrls.push(`/api/images/${uploadedFile.id}`);
                }
            } catch (err) {
                console.error("GridFS Image Upload Error:", err);
                return res.status(500).json({ message: "Failed to upload one or more images" });
            }
        }

        const newEvent = new Event({
            title,
            description,
            category,
            images: imageUrls,
            price: price || 0,
            totalTickets,
        });

        const savedEvent = await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: savedEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Failed to create event" });
    }
});

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get("/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({ events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to retrieve events" });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get("/events/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ event });
    } catch (error) {
        console.error("Error fetching event details:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid event ID format" });
        }
        res.status(500).json({ message: "Failed to retrieve event details" });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Admin (Planner) only
router.put("/events/:id", authMiddleware(["admin"]), upload.array("images", 10), async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const updateData = { ...req.body };

        // Handle image deletions
        let currentImages = event.images || [];
        if (req.body.deletedImages) {
            let deletedImages = req.body.deletedImages;
            if (typeof deletedImages === "string") {
                deletedImages = [deletedImages]; // Handle single item
            }

            for (const imageUrl of deletedImages) {
                // Extract ID from URL /api/images/:id
                const idMatch = imageUrl.match(/\/api\/images\/([a-f\d]{24})/i);
                if (idMatch) {
                    const imageId = idMatch[1];
                    try {
                        await deleteImage(imageId);
                    } catch (err) {
                        console.error(`Failed to delete image ${imageId} from GridFS:`, err);
                        // Continue even if physical deletion fails
                    }
                }
                currentImages = currentImages.filter(img => img !== imageUrl);
            }
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    const uploadedFile = await uploadImageStream(file.buffer, file.originalname, file.mimetype);
                    currentImages.push(`/api/images/${uploadedFile.id}`);
                }
            } catch (err) {
                console.error("GridFS Image Upload Error:", err);
                return res.status(500).json({ message: "Failed to upload new images" });
            }
        }

        updateData.images = currentImages;

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true } // Return updated document
        );

        res.status(200).json({ message: "Event updated successfully", event });
    } catch (error) {
        console.error("Error updating event:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid event ID format" });
        }
        res.status(500).json({ message: "Failed to update event" });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Admin (Planner) only
router.delete("/events/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid event ID format" });
        }
        res.status(500).json({ message: "Failed to delete event" });
    }
});

module.exports = router;