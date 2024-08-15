import express from "express";
import { signupUser,getSuggestedUsers, loginUser,getFollowers, logoutUser, followUnfollowUser, updateUser, getUserProfile, searchUser} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import logApiPath from "../middlewares/loggerMiddleware.js";
import errorHandler from "../middlewares/errorHandler.js";
const router = express.Router();

router.use(logApiPath);

router.post("/signup", signupUser);
router.post("/login", loginUser);

router.use(protectRoute);
router.get("/profile/:query",  getUserProfile);
router.get("/suggested",  getSuggestedUsers);
router.post("/logout", logoutUser);
router.post("/follow/:id", followUnfollowUser);
router.put(`/update`, updateUser);
router.get("/search/:query", searchUser);
router.get("/getFollowers", getFollowers);

router.use(errorHandler);

export default router;