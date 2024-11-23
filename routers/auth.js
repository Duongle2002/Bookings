// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const authenticateToken = require("../middleware/authenticateToken");

// Render register and login pages
router.get('/register', (req, res) => res.render('auth/register', { title: 'Register' }));
router.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));

// User registration
router.post('/register', async (req, res) => {
    try {
      // Tạo người dùng mới với email và mật khẩu đã mã hóa
      const user = new User({
        username: req.body.username,
        email: req.body.email,  // Đảm bảo có emai
        password: req.body.password,  // Không cần mã hóa ở đây
      });
  
      // Lưu người dùng vào cơ sở dữ liệu
      await user.save();
  
      // Chuyển hướng đến trang đăng nhập
      res.redirect('/auth/login');
    } catch (error) {  // Make sure to include 'error' here
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        const errorMessage = `Tài khoản ${field} đã tồn tại. Vui lòng chọn một tên khác.`;
        res.render('auth/register', { errorMessage });
      } else {
        res.render('auth/register', { errorMessage: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
      }
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      // console.log('Username:', username);
      // console.log('Password:', password);
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).send('Invalid username or password');
  
      // Kiểm tra mật khẩu
      const isPasswordValid = await user.isValidPassword(password);
      if (!isPasswordValid) {
        // console.log('Password invalid');
        return res.status(400).send('Invalid username or password');
      }
  
      // console.log('Password valid');
      const token = jwt.sign({
        userId: user._id,
        username: user.username,
        email: user.email,
        userDisplayName: user.userDisplayName,
        role: user.role,
        birthday: user.birthday,
        gender: user.gender,
        location: user.location
      }, 'your_jwt_secret', { expiresIn: '1h' });
      // console.log('JWT Token:', token);
  
      // Lưu token vào cookie (hoặc có thể lưu vào session nếu cần)
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // Cookie sẽ hết hạn sau 1 giờ
  
      // Chuyển hướng đến trang index.ejs
      res.redirect('/');
    } catch (err) {
      // console.error('Login error:', err);
      res.status(500).send('Login error');
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;  // Lấy thông tin người dùng từ req.user
    console.log(user); // Ghi log thông tin người dùng để kiểm tra

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Trả về thông tin người dùng
    const userProfile = {
      username: user.username,
      userDisplayName: user.userDisplayName,
      email: user.email,
      role: user.role,
      birthday: user.birthday,
      gender: user.gender,
      location: user.location
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/auth/login');
})

router.post('/profile/update', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // The user info from the JWT token
    const { userDisplayName, email, birthday, gender, location } = req.body;

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update the user's profile details
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      userDisplayName,
      email,
      birthday,
      gender,
      location,
    }, { new: true }); // Return the updated user

    // Redirect to the profile page or show a success message
    res.redirect('/auth/profile'); // Or you can render a confirmation message
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

router.get('/profile/update', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // The user info from the JWT token

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Render the profile update page and pass the current user's data to the template
    res.render('auth/updateProfile', {
      user,
      title: 'Update Profile',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rendering profile update page' });
  }
});


module.exports = router;
