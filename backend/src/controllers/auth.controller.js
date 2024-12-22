import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"


console.log(process.env.CLOUDINARY_API_KEY);

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        // Validate that all fields are provided
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Provide all fields" });
        }

        // Validate that password is at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least six(6) digits" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        // Generate JWT token and save the user
        generateToken(newUser._id, res);
        await newUser.save();

        return res.status(200).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        console.error("Error in signup controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = generateToken(existingUser._id, res)

        res.status(200).json({
            id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            profilePic: existingUser.profilePic,
            token: token

        })

    } catch (error) {
        console.error("Error in Signin controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const signout = (req, res) => {
    try {
        res.cookie("jwt", "", { newAge: 0 })
        res.status(200).json({ message: "Successfully Logged out" })
    } catch (error) {
        console.error("Error in logout controller", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(404).json({ message: "profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error in update profile", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const updateProfileName = async (req, res) => {
    try {
        const { fullName } = req.body;
        const userId = req.user._id;

        if (!fullName) {
            return res.status(400).json({ message: "Full name is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName: fullName },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in update profile name", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth controller", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}