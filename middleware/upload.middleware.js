const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); // Đường dẫn đến thư mục lưu trữ
  },
  filename: function (req, file, cb) {
    let fileName = 'avt_user_' + req.iduser;
    const { iddevice } = req.query;
    if (iddevice) fileName = 'avt_device_' + iddevice;

    const ext = path.extname(file.originalname);
    cb(null, fileName + ext);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
// // API để xử lý phần tải lên và trả về đường dẫn của tệp
// app.post('/upload', upload.single('avt'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No files were uploaded.');
//   }

//   const filePath = req.file.path;

//   // Trả về đường dẫn tới tệp đã tải lên
//   res.send({ path: filePath });
// });
