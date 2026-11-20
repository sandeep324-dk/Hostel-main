require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Admin = require('./models/Admin');
const Hostel = require('./models/Hostel');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const email = 'admin@gmail.com';
        const password = 'Admin@12345';

        // Find an existing hostel
        let hostel = await Hostel.findOne();

        if (!hostel) {
            console.log('No hostel found in MongoDB.');
            console.log('Please create a hostel first.');
            await mongoose.disconnect();
            return;
        }

        // Find the existing User
        let user = await User.findOne({ email });

        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);

            user = new User({
                email,
                password: hashedPassword,
                isAdmin: true
            });

            await user.save();

            console.log('User created.');
        } else {
            // Make sure this user is an admin
            user.isAdmin = true;
            await user.save();

            console.log('User already exists. isAdmin set to true.');
        }

        // Check if Admin record already exists
        let admin = await Admin.findOne({ user: user._id });

        if (admin) {
            console.log('Admin record already exists.');
        } else {
            admin = new Admin({
                name: 'Admin',
                email: email,
                father_name: 'Admin Father',
                contact: '9876543210',
                address: 'Admin Address',
                dob: new Date('1995-01-01'),
                cnic: '1234567890123',
                user: user._id,
                hostel: hostel._id
            });

            await admin.save();

            console.log('Admin record created.');
        }

        console.log('--------------------------------');
        console.log('ADMIN LOGIN');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Hostel:', hostel.name);
        console.log('--------------------------------');

        await mongoose.disconnect();

    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
};

createAdmin();