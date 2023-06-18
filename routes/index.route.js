const express = require('express');
const router = express.Router();
const db = require('../database/connect-mysql');
const ok = require('../utils/response');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');

// ping server
router.get('/ping', authMiddleware.Logged, async (req, res) => {
  try {
    const [result] = await db.query('Select * from user');
    return res.send(ok(result));
  } catch (error) {
    return res.send(ok(null, 500, error));
  }
});

//register
router.post('/register', async (req, res) => {
  try {
    const info = req.body;

    const requiredFields = ['email', 'phone', 'fullName', 'password'];
    const missingFields = requiredFields.filter((field) => !info[field]);
    if (missingFields.length > 0) {
      return res.send(ok(null, 400, 'Vui lòng nhập đủ thông tin'));
    }

    const { email, phone, fullName, password } = info;

    let queryEmail = `select 1 from user where email='${email}'`;
    const [emailData] = await db.query(queryEmail);
    if (emailData.length > 0)
      return res.send(ok(null, 400, 'Email already exists'));

    let queryPhone = `select 1 from user where phone='${phone}'`;
    const [phoneData] = await db.query(queryPhone);
    if (phoneData.length > 0)
      return res.send(ok(null, 400, 'Phone already exists'));

    const [result] = await db.query(
      'INSERT INTO user (email, phone, fullName,password) VALUES (?, ?, ?,?)',
      [email, phone, fullName, password]
    );

    const userId = result.insertId;
    return res.send(ok({ userId }));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    //check mail or phone
    let queryEmailOrPhone = `select 1 from user where email='${emailOrPhone}' or phone='${emailOrPhone}'`;
    const [userData] = await db.query(queryEmailOrPhone);
    if (userData.length == 0)
      return res.send(ok(null, 400, 'Email hoặc số điện thoại không hợp lệ'));

    //check password
    let queryPassword = `select * from user where (email='${emailOrPhone}' or phone='${emailOrPhone}') and password='${password}'`;
    const [userPassword] = await db.query(queryPassword);
    if (userPassword.length == 0)
      return res.send(ok(null, 400, 'Mật khẩu không đúng'));

    const { iduser, email, phone, fullname } = userPassword[0];
    const accessToken = jwt.sign(
      { iduser, email, phone, fullname },
      'ACCESS_TOKEN_SECRET',
      {
        expiresIn: '5000m',
      }
    );
    return res.send(ok({ accessToken }));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//get list device of user
router.get('/user/devices', authMiddleware.Logged, async (req, res) => {
  try {
    const iduser = req.iduser;
    let queryDevice = `
    select * from device where iduser='${iduser}' 
    `;
    const [data] = await db.query(queryDevice);

    return res.send(ok(data));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//get data for device
router.get('/device', authMiddleware.Logged, async (req, res) => {
  try {
    const { iddevice } = req.query;

    let queryData = `
    select * from device_data 
    where iddevice='${iddevice}'
    ORDER BY CONCAT(date, ' ', time) DESC
    LIMIT 10
    `;
    const [data] = await db.query(queryData);

    return res.send(ok(data));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//create device
router.post('/device', authMiddleware.Logged, async (req, res) => {
  try {
    const info = req.body;
    const iduser = req.iduser;
    const requiredFields = [
      'name',
      'gender',
      'age',
      'weight',
      'height',
      'date',
      'time',
      'nickname',
    ];
    const missingFields = requiredFields.filter((field) => !info[field]);
    if (missingFields.length > 0) {
      return res.send(ok(null, 400, 'Vui lòng nhập đủ thông tin'));
    }

    const { name, gender, age, weight, height, date, time, nickname } = info;

    const [result] = await db.query(
      'INSERT INTO device (name, gender, age, weight, height, date, time, nickname,iduser ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, gender, age, weight, height, date, time, nickname, iduser]
    );

    const iddevice = result.insertId;
    return res.send(ok({ iddevice }));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//update device info

//delete device

module.exports = router;
