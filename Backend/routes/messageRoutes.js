import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { sendMessage, getMessages, getConversations, deleteMessages } from "../controllers/messageControler.js";
const router = express.Router();

router.use(protectRoute);

router.get("/conversations", getConversations);
router.post("/", sendMessage);
router.get("/:otherUserId", getMessages);
router.delete("/delete/:messageId", deleteMessages);

export default router;