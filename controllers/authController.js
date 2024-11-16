// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register user
exports.registerUser = async (req, res) => {
	const { name, email, role, password } = req.body;

	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = new User({ name, email, role, password });
		await user.save();

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRATION,
		});

		res.status(201).json({ token });
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
};

// Login user
exports.loginUser = async (req, res) => {
	const { email, password, role } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		if (user.role !== role) {
			return res
				.status(403)
				.json({ message: "Access denied: Role mismatch" });
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRATION,
			}
		);

		res.json({ token, role: user.role });
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
};
