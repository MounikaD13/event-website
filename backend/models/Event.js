const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["weddings", "birthdays", "milestone", "business"]
        },
        images: [
            {
                type: String, // Will store the GridFS file ID or download URL
            },
        ],
        price: {
            type: Number,
            default: 0,
        },
        totalTickets: {
            type: Number,
            required: true,
        },
        availableTickets: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed", "cancelled"],
            default: "upcoming",
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to initialize availableTickets
eventSchema.pre("save", function () {
    if (this.isNew && this.totalTickets) {
        this.availableTickets = Number(this.totalTickets);
    }
});

module.exports = mongoose.model("Event", eventSchema);