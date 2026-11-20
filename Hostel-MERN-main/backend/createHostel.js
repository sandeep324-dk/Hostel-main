const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

const createHostel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const existingHostel = await Hostel.findOne({ name: "Boys Hostel" });

        if (existingHostel) {
            console.log("Boys Hostel already exists");
            console.log(existingHostel);
            process.exit(0);
        }

        const hostel = new Hostel({
            name: "Boys Hostel",
            location: "Hyderabad",
            rooms: 100,
            capacity: 200,
            vacant: 200
        });

        await hostel.save();

        console.log("Hostel created successfully!");
        console.log(hostel);

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createHostel();