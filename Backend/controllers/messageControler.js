import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/userModel.js";

async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    let { img, video } = req.body;
    const senderId = req.user._id;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      video = uploadResponse.secure_url;
    }

    let newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
      video: video || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
          img: img,
          video: video,
        },
      }),
    ]);

    const senderDetails = await User.findById(senderId);

    newMessage = {
      ...newMessage.toObject(), // Convert Mongoose document to plain JavaScript object
      username: senderDetails ? senderDetails.username : null,
      profilePic: senderDetails ? senderDetails.profilePic : null,
    };

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in sendMessage: ", error);
  }
}

async function getMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    // if (!conversation) {
    //   return res.status(404).json({ error: "Conversation not found" });
    // }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getMessages: ", error);
  }
}

async function deleteMessages(req, res) {
  const { messageId } = req.params;
  const userId = req.user._id;
  try {
    const message = await Message.findOne({ _id: messageId });

    if (!message) {
      return res.status(404).json({ error: "message not found!" });
    }
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(401)
        .json({ error: "You can't delete others messages" });
    }

    if (message.img) {
      const img_id = message.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(img_id);
    }
    if (message.video) {
      const video_id = message.video.split("/").pop().split(".")[0];
      const result = await cloudinary.uploader.destroy(video_id, {
        resource_type: "video",
      });
      console.log("video id:", result);
    }

    const lastMessage = await Message.findOne({
      conversationId: message.conversationId,
    })
    .sort({ createdAt: -1 });

    let conversation;
    if (lastMessage._id.toString() === message._id.toString()) {
      conversation = await Conversation.findById(message.conversationId).populate({
        path: "participants",
        select: "username profilePic",
      })
      .sort({ updatedAt: -1 });
      conversation.lastMessage.text = "removed a message";
      conversation.lastMessage.img = null;
      conversation.lastMessage.video = null;
      await conversation.save();
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    }

    await Message.deleteOne({
      _id: messageId,
    });
    io.emit("deleteMessage", {
      message: message, conversation: conversation, lastMessage: lastMessage
    });
    res.status(200).json({message: "messages deleted", conversation: conversation, lastMessage: lastMessage});
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getMessages: ", error);
  }
}

async function getConversations(req, res) {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: "participants",
        select: "username profilePic",
      })
      .sort({ updatedAt: -1 });

    // remove the current user from the list of participants
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getConversations: ", error);
  }
}

export { sendMessage, getMessages, getConversations, deleteMessages };
