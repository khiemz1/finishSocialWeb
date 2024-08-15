import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const creatPost = async (req, res) => {
  try {
    const postedBy = req.user._id;
    const { text } = req.body;
    let { img, video } = req.body;

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // Upload image if provided
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    // Upload video if provided
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      video = uploadResponse.secure_url;
    }

    const post = new Post({
      postedBy,
      text,
      img,
      video,
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "repost", // Populate repost field with the original post details
        populate: {
          path: "postedBy", // Further populate repost's postedBy field with user details
          select: "username profilePic", // Select specific fields to return
        },
      }) // Populate the original post's postedBy field
      .exec();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Sort replies by updatedAt in descending order
    post.replies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: ", error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "you can't delete others's posts" });
    }

    if (post.img) {
      const img_id = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(img_id);
    }
    if (post.video) {
      const video_id = post.video.split("/").pop().split(".")[0];
      const result = await cloudinary.uploader.destroy(video_id, {
        resource_type: "video",
      });
      console.log("video id:", result);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: ", error);
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!post.likes.includes(req.user._id)) {
      await post.updateOne({ $push: { likes: req.user._id } });
      res.status(200).json({ message: "Post liked successfully" });
    } else {
      await post.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).json({ message: "Post unliked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likeUnlikePost: ", error);
  }
};

const replyPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "text should not be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const reply = {
      userId,
      text,
      userProfilePic,
      username,
    };

    await post.updateOne({ $push: { replies: reply } });
    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in replyPost: ", error);
  }
};
const rePost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    // Tìm post gốc bằng postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Tạo một repost mới
    const repost = new Post({
      postedBy: userId,
      text: text,
      repost: postId,
    });

    // Lưu repost mới
    await repost.save();

    // Thêm userId vào rePosts của post gốc
    await post.updateOne({ $push: { rePosts: req.user._id } });
    const newPost = await Post.findById(repost._id)
      .populate({
        path: "repost", // Populate repost field with the original post details
        populate: {
          path: "postedBy", // Further populate repost's postedBy field with user details
          select: "username profilePic", // Select specific fields to return
        },
      }) // Populate the original post's postedBy field
      .exec();

    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in rePost: ", error);
  }
};
// const rePost = async (req, res) => {
//     try {
//         const {text}  = req.body;
//         const postId = req.params.id;
//         const userId = req.user._id;

//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ error: "Post not found" });
//         }
//         const rePost = {
//             userId, text
//         }
//         await post.updateOne({ $push: { rePosts: rePost } });
//         res.status(200).json(rePost);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//         console.log("Error in rePost: ", error);
//     }
// }

const getLikesPost = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch posts liked by the user, including repost details and user information
    const posts = await Post.find({ likes: { $in: [userId] } }).populate({
      path: "repost",
      populate: {
        path: "postedBy",
        model: "User",
        select: "username profilePic",
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getLikesPost: ", error);
  }
};

const getfeedPost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    // Fetch the posts by the current user, including repost details and user information
    let posts = await Post.find({ postedBy: req.user._id })
      .populate({
        path: "repost",
        populate: {
          path: "postedBy",
          model: "User",
          select: "username profilePic",
        },
      })
      .sort({ createdAt: -1 });

    // Fetch the posts by the users that the current user is following, including repost details and user information
    const followingPosts = await Post.find({ postedBy: { $in: following } })
      .populate({
        path: "repost",
        populate: {
          path: "postedBy",
          model: "User",
          select: "username profilePic",
        },
      })
      .sort({ createdAt: -1 });

    // Concatenate the posts
    posts = posts.concat(followingPosts);

    // If no posts are found, get random posts
    if (posts.length === 0) {
      const totalPosts = await Post.countDocuments();
      if (totalPosts > 0) {
        const randomPosts = await Post.aggregate([
          { $sample: { size: 10 } },
          { $sort: { createdAt: -1 } },
        ]).populate({
          path: "repost",
          populate: {
            path: "postedBy",
            model: "User",
            select: "username profilePic",
          },
        });
        return res.status(200).json(randomPosts);
      } else {
        return res.status(404).json({ error: "No posts available" });
      }
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getfeedPost: ", error);
  }
};

const getUserPost = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "repost",
        populate: {
          path: "postedBy", // Populates the postedBy field of the reposted post
          select: "username profilePic", // Optionally select only necessary fields
        },
      })
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUserPost: ", error);
  }
};

export {
  creatPost,
  rePost,
  getPost,
  getLikesPost,
  deletePost,
  likeUnlikePost,
  replyPost,
  getfeedPost,
  getUserPost,
};
