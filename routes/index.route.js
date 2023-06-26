const express = require('express');
const router = express.Router();
const db = require('../database/connect-mysql');
const ok = require('../utils/response');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
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

//get info user
router.get('/user', authMiddleware.Logged, async (req, res) => {
  try {
    const iduser = req.iduser;

    const query = `
          select email,phone,fullname,avt,iduser from user where iduser=${iduser}
        `;

    const [result] = await db.query(query);
    res.send(ok(result));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//update info user
router.post(
  '/user/update',
  authMiddleware.Logged,
  upload.single('avt'),
  async (req, res) => {
    try {
      const iduser = req.iduser;

      const { fullname, password, email, phone, avt, oldPassword } = req.body;

      if (password) {
        if (!oldPassword)
          return res.send(ok(null, 400, 'oldPassword is require'));
        const getUserByPassAndId = `SELECT 1 FROM user where iduser=${iduser} and password=${oldPassword}`;
        const [result] = await db.query(getUserByPassAndId);
        if (result.length == 0)
          return res.send(ok(null, 400, 'oldPassword invalid'));
      }

      const query = `
          UPDATE user
          SET 
          fullname = IFNULL(${db.escape(fullname)}, fullname),
          password = IFNULL(${db.escape(password)}, password),
          email = IFNULL(${db.escape(email)}, email),
          phone = IFNULL(${db.escape(phone)}, phone),
          avt = IFNULL(${db.escape(avt)}, avt) 
          WHERE iduser = ${db.escape(iduser)};
        `;

      const [result] = await db.query(query);
      res.send(ok(result));
    } catch (error) {
      console.log(error);
      return res.send(ok(null, 500, error));
    }
  }
);

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
    const requiredFields = ['name', 'gender', 'age', 'weight', 'height'];
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
router.post('/device/update', authMiddleware.Logged, async (req, res) => {
  try {
    const { iddevice } = req.query;
    if (!iddevice) return res.send(ok(null, 400, 'Vui lòng cho biết iddevice'));
    const { name, gender, age, weight, height, date, time, nickname, avt } =
      req.body;
    const query = `
          UPDATE device
          SET 
          name = IFNULL(${db.escape(name)}, name),
          gender = IFNULL(${db.escape(gender)}, gender),
          age = IFNULL(${db.escape(age)}, age),
          weight = IFNULL(${db.escape(weight)}, weight),
          height = IFNULL(${db.escape(height)}, height),
          date = IFNULL(${db.escape(date)}, date),
          time = IFNULL(${db.escape(time)}, time),
          avt = IFNULL(${db.escape(avt)}, avt),
          nickname = IFNULL(${db.escape(nickname)}, nickname)
          WHERE iddevice = ${db.escape(iddevice)};
        `;

    const [result] = await db.query(query);
    res.send(ok(result));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

//delete device
router.delete('/device', authMiddleware.Logged, async (req, res) => {
  try {
    const { iddevice } = req.query;

    let queryDeleteDevice = `
    DELETE FROM device WHERE iddevice=${iddevice};
    `;
    let queryDeleteDeviceData = `
    DELETE FROM device_data WHERE iddevice=${iddevice};
    `;
    const [deleteDevice] = await db.query(queryDeleteDevice);
    const [deleteDeviceData] = await db.query(queryDeleteDeviceData);

    return res.send(ok({ deleteDevice, deleteDeviceData }));
  } catch (error) {
    console.log(error);
    return res.send(ok(null, 500, error));
  }
});

router.post(
  '/upload-media',
  authMiddleware.Logged,
  upload.single('avt'),
  async (req, res) => {
    try {
      const filePath = req.file?.path;
      return res.send(ok(filePath));
    } catch (error) {
      console.log(error);
      return res.send(ok(null, 500, error));
    }
  }
);
module.exports = router;
