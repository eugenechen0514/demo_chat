const assert = require('assert');
const express = require('express');

const RoomModel = require('../models/rooms');
const UserModel = require('../models/users');

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/chat', function(req, res, next) {
  const {id, name} = req.body;
  (async ()=> {
    assert(id);
    assert(name);

    const own = await UserModel.ensureRegisterUser({id, name});

    const others = (await UserModel.getUsers()).filter(user => user.id !== own.id);
    return {own, others}
  })()
      .then((data) => {
        res
            .cookie('userId', id)
            .cookie('userName', name)
            .render('chat', data);
      })
      .catch(next);
});

module.exports = router;
