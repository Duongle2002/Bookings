const express = require('express');
const router = express.Router();
const Booking = require('../model/booking');
// const authenticateToken = require('../middleware/authenticateToken');


// Xem danh sách đặt chỗ
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.render('index', { 
            bookings, 
            successMessage: req.flash('successMessage'), 
            errorMessage: req.flash('errorMessage') 
        });
    } catch (err) {
        req.flash('errorMessage', "Error fetching bookings");
        res.redirect('/');
    }
});

// Trang thêm đặt chỗ
router.get('/create', (req, res) => {
    res.render('create',{ messages: req.flash() });
});

// Thêm mới đặt chỗ
router.post('/create', async (req, res) => {
    try {
        const { customerName, date, time } = req.body;

        // Kiểm tra ngày và giờ có hợp lệ hay không
        if (!customerName || !date || !time) {
            req.flash('errorMessage', "Vui lòng điền đầy đủ thông tin.");
            return res.redirect('/create');
        }

        // Lấy thời gian hiện tại
        const currentDateTime = new Date();
        const bookingDateTime = new Date(`${date}T${time}:00`);

        // Kiểm tra nếu ngày và giờ đặt chỗ trước thời gian hiện tại
        if (bookingDateTime < currentDateTime) {
            req.flash('errorMessage', "Không thể đặt chỗ vào thời gian trong quá khứ.");
            return res.redirect('/create');
        }

        // Kiểm tra nếu đặt chỗ đã tồn tại trong cùng một ngày và giờ
        const existingBooking = await Booking.findOne({ date, time });
        if (existingBooking) {
            req.flash('errorMessage', "Lịch đặt chỗ này đã có.");
            return res.redirect('/create');
        }

        // Tạo một booking mới với trạng thái mặc định là "Pending"
        const newBooking = new Booking({
            customerName,
            date,
            time,
            status: 'Pending'
        });

        await newBooking.save();
        req.flash('successMessage', "Đặt chỗ thành công!");
        res.redirect('/'); 

    } catch (err) {
        console.error(err);
        req.flash('errorMessage', "Đã xảy ra lỗi khi tạo đặt chỗ.");
        res.redirect('/create');
    }
});

// Trang sửa thông tin đặt chỗ
router.get('/edit/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        res.render('edit', { 
            booking, 
            successMessage: req.flash('successMessage'), 
            errorMessage: req.flash('errorMessage') 
        });
    } catch (err) {
        res.status(500).send("Error fetching booking details");
    }
});

// Cập nhật thông tin đặt chỗ
// Cập nhật thông tin đặt chỗ
router.post('/edit/:id', async (req, res) => {
    const { customerName, date, time } = req.body;
    try {
        // Kiểm tra ngày và giờ có hợp lệ hay không
        if (!customerName || !date || !time) {
            req.flash('errorMessage', "Vui lòng điền đầy đủ thông tin.");
            return res.redirect(`/edit/${req.params.id}`);
        }

        // Lấy thời gian hiện tại
        const currentDateTime = new Date();
        const bookingDateTime = new Date(`${date}T${time}:00`);

        // Kiểm tra nếu ngày và giờ cập nhật là trong quá khứ
        if (bookingDateTime < currentDateTime) {
            req.flash('errorMessage', "Không thể cập nhật thời gian trong quá khứ.");
            return res.redirect(`/edit/${req.params.id}`);
        }

        // Kiểm tra nếu đặt chỗ trùng với một ngày và giờ đã tồn tại (ngoại trừ bản ghi hiện tại)
        const existingBooking = await Booking.findOne({ date, time, _id: { $ne: req.params.id } });
        if (existingBooking) {
            req.flash('errorMessage', "Lịch đặt chỗ này đã có.");
            return res.redirect(`/edit/${req.params.id}`);
        }

        // Cập nhật thông tin đặt chỗ
        await Booking.findByIdAndUpdate(req.params.id, { customerName, date, time });
        req.flash('successMessage', "Cập nhật thành công!");
        res.redirect('/');

    } catch (err) {
        console.error(err);
        req.flash('errorMessage', "Đã xảy ra lỗi khi cập nhật thông tin.");
        res.redirect(`/edit/${req.params.id}`);
    }
});


// Hủy đặt chỗ
router.get('/cancel/:id', async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
        req.flash('successMessage', "Hủy đặt chỗ thành công!");
        res.redirect('/');
    } catch (err) {
        req.flash('errorMessage', "Đã xảy ra lỗi khi hủy đặt chỗ.");
        res.redirect('/');
    }
});

module.exports = router;
