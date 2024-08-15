import express from "express";
const router = express.Router();
import { creatPost , getPost,rePost, getLikesPost, deletePost, likeUnlikePost, replyPost, getfeedPost, getUserPost} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
import logApiPath from "../middlewares/loggerMiddleware.js";
import errorHandler from "../middlewares/errorHandler.js";

router.use(protectRoute);
router.use(logApiPath);

router.get("/feed",  getfeedPost);
router.get("/getLikesPost",  getLikesPost); 
router.get("/user/:username",  getUserPost);
router.post("/creat",  creatPost);
router.delete("/delete/:id",  deletePost);
router.put("/like/:id",  likeUnlikePost);
router.put("/reply/:id",  replyPost); 
router.put("/rePost/:id",  rePost); 
router.get("/:id",  getPost);

router.use(errorHandler);

export default router;
