import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Post from "../models/postModel.js";
import { io } from "../socket/socket.js";

const getUserProfile = async (req, res, next) => {
  // get data by id or username
  const { query } = req.params;
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findById({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return next(new Error("User not found"));
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const userFollowers = await User.findById(userId).populate("followers");

    if (!userFollowers) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = await Promise.all(
      userFollowers.followers.map(async (followerId) => {
        return User.findById(followerId).select("-password -updatedAt -__v");
      })
    );

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  const { query } = req.params; // Assuming the search text is passed as a URL parameter

  try {
    // Convert the search query to lowercase
    const lowerCaseQuery = query.toLowerCase();

    // Perform a case-insensitive search for users whose name or username contains the query string
    const users = await User.find({
      $or: [
        { username: { $regex: lowerCaseQuery, $options: "i" } },
        { name: { $regex: lowerCaseQuery, $options: "i" } },
      ],
    }).select("-password -updatedAt");

    if (users.length === 0) {
      res.status(404).json({ error: "No users found" });
      return next(new Error("No users found"));
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Ivalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in signupUser", error.message);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({ error: "Invalid username or password" });
      return next(new Error("Invalid username or password"));
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ error: "Invalid username or password" });
      return next(new Error("Invalid username or password"));
    }
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in logoutUser:", error.message);
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id == req.user._id)
      return res.status(400).json({ error: "You cannot follow yourself" });
    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      const currentPageUser = await User.findById(id);
      io.emit("followUnfollow", {currentPageUser: currentPageUser});
      res
        .status(200)
        .json({
          message: `Unfollowed ${userToModify.name}`,
          followersNumber: currentPageUser.followers.length,
          followingNumber: currentPageUser.following.length,
        });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      const currentPageUser = await User.findById(id);
      io.emit("followUnfollow", {currentPageUser: currentPageUser});
      res
        .status(200)
        .json({
          message: `Followed ${userToModify.name}`,
          followersNumber: currentPageUser.followers.length,
          followingNumber: currentPageUser.following.length,
        });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in follow activities:", error.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, currentPassword, newPassword, bio } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;

  try {
    if (!userId) return res.status(400).json({ error: "Unauthorized" });
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    // Handle password update
    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;

      // Save user and send password update response
      user = await user.save();
      return res.status(200).json({ message: "Password updated successfully!", user });
    }

    // Handle profile picture update
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { fetch_format: "auto", quality: "auto" },
        ],
      });
      profilePic = uploadedResponse.secure_url;
    }

    // Update other user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Update replies in posts
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    // Send profile update response
    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
};


const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id.toString())
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in updateUser: ", error.message);
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  searchUser,
  getFollowers,
};
