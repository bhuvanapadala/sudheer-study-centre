const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User  = require('../models/User');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (email !== process.env.MAIL_USER) {
      return res.status(403).json({ message: 'Reset access denied' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered' });

    // Send reset link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Sudheer Study Centre" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello ${user.username},</p>
        <p>Click the button below to reset your password:</p>
        <a href="https://sudheer-study-centre.vercel.app/change-password.html?username=${user.username}" 
           style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none;">
           Reset Password</a>
        <p>If you didn’t request this, just ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('Email Error:', err);
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
};


const changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err });
  }
};

module.exports = { login, forgotPassword, changePassword };
