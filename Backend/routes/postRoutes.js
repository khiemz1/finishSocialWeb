import express from "express";
const router = express.Router();
import { creatPost , getPost,rePost,updatePost, getLikesPost,getNotificaions, deletePost, likeUnlikePost, replyPost, getfeedPost, getUserPost} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
import logApiPath from "../middlewares/loggerMiddleware.js";
import errorHandler from "../middlewares/errorHandler.js";

router.use(protectRoute);

router.get("/feed",  getfeedPost);
router.get("/getLikesPost",  getLikesPost); 
router.get("/user/:username",  getUserPost);
router.post("/creat",  creatPost);
router.delete("/delete/:id",  deletePost);
router.post("/update/:id",  updatePost);
router.put("/like/:id",  likeUnlikePost);
router.put("/reply/:id",  replyPost); 
router.put("/rePost/:id",  rePost); 
router.get("/getNotifys",  getNotificaions);
router.get("/:id",  getPost);

export default router;
