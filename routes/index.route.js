const express = require('express');
const router = express.Router();
const db = require('../database/connect-mysql');
const ok = require('../utils/response');
router.get('/ping', async (req, res) => {
  try {
    const [result] = await db.query('Select * from user');
    return res.send(ok(result));
  } catch (error) {
    return res.send(ok(null, 500, error));
  }
});

//register
router.post('/resiger', async (req, res) => {
  try {
    const [result] = await db.query('Select * from user');
    return res.send(ok(result));
  } catch (error) {
    return res.send(ok(null, 500, error));
  }
});

module.exports = router;
