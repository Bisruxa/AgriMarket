const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

router.use(protect);

router.get('/', chatController.getChats);
router.get('/:id', chatController.getChat);
router.post('/', chatController.createChat);
router.delete('/:id', chatController.deleteChat);
router.post('/:id/messages/append', chatController.appendMessage);
router.post('/:id/messages', chatController.sendMessage);

module.exports = router;
