const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/middleware");
const multer = require("multer");
const { uploadImageStream, deleteImage } = require("../utils/gridFs");

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/services
// @desc    Create a service for an event
// @access  Admin (Planner) only
router.post("/services", authMiddleware(["admin"]), upload.array("images", 10), async (req, res) => {
    try {
        const { eventId, title, description } = req.body;
        if (!eventId || !title || !description) {
            return res.status(400).json({ message: "Please provide all required fields (eventId, title, description)" });
        }

        // Verify the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
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

        const newService = new Service({
            eventId,
            title,
            description,
            images: imageUrls,
        });

        const savedService = await newService.save();
        res.status(201).json({ message: "Service created successfully", service: savedService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service" });
    }
});

// @route   GET /api/services/event/:eventId
// @desc    Get all services for a specific event
// @access  Public
router.get("/services/event/:eventId", async (req, res) => {
    try {
        const services = await Service.find({ eventId: req.params.eventId });
        res.status(200).json({ services });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: "Failed to retrieve services" });
    }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get("/services/:id", async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ service });
    } catch (error) {
        console.error("Error fetching service details:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid service ID format" });
        }
        res.status(500).json({ message: "Failed to retrieve service details" });
    }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin (Planner) only
router.put("/services/:id", authMiddleware(["admin"]), upload.array("images", 10), async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const updateData = { ...req.body };

        // Handle image deletions
        let currentImages = service.images || [];
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

        service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true } // Return updated document
        );

        res.status(200).json({ message: "Service updated successfully", service });
    } catch (error) {
        console.error("Error updating service:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid service ID format" });
        }
        res.status(500).json({ message: "Failed to update service" });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin (Planner) only
router.delete("/services/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Delete associated images
        if (service.images && service.images.length > 0) {
            for (const imageUrl of service.images) {
                const idMatch = imageUrl.match(/\/api\/images\/([a-f\d]{24})/i);
                if (idMatch) {
                    const imageId = idMatch[1];
                    try {
                        await deleteImage(imageId);
                    } catch (err) {
                        console.error(`Failed to delete image ${imageId} from GridFS:`, err);
                    }
                }
            }
        }

        await Service.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid service ID format" });
        }
        res.status(500).json({ message: "Failed to delete service" });
    }
});

module.exports = router;
