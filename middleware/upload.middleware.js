const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Khởi tạo middleware của multer để xử lý phần tải lên
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); // Đường dẫn đến thư mục lưu trữ
  },
  filename: function (req, file, cb) {
    // Tên tệp sẽ được đặt là thời gian tải lên và tên gốc của tệp
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// API để xử lý phần tải lên và trả về đường dẫn của tệp
app.post('/upload', upload.single('avt'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const filePath = req.file.path;

  // Trả về đường dẫn tới tệp đã tải lên
  res.send({ path: filePath });
});
