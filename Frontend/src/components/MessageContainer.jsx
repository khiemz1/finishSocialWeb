import {
  Avatar,
  AvatarBadge,
  background,
  Box,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import useShowToast from "../hooks/useShowToast";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import messageSound from "../assets/sounds/message.mp3";
import { Link, Link as RouterLink } from "react-router-dom";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";

const MessageContainer = () => {
  const showToast = useShowToast();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const messageEndRef = useRef(null);

  // console.log("selectedConversation", selectedConversation)
  let isOnline = onlineUsers.includes(selectedConversation.userID);

  useEffect(() => {
    if (!socket) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    socket.on("newMessage", (message) => {
      console.log("new message::", message);
      if (
        selectedConversation &&
        selectedConversation.userID === message.sender
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      if (!document.hasFocus()) {
        // const sound = new Audio(messageSound);
        // sound.play();

        if (Notification.permission === "granted") {
          new Notification("New Message", {
            body: `${message.username}: ${message.text || "New media message"}`,
            icon: message.profilePic || "/default-profile-pic.png",
            duration: 500,
          });
        }
      }

      let conversationAlreadyExists = false;

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation.participants[0]._id === message.sender) {
            conversationAlreadyExists = true;
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                img: message.img,
                video: message.video,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });

        if (conversationAlreadyExists) {
          const selectedConvIndex = updatedConversations.findIndex(
            (conv) => conv.participants[0]._id === message.sender
          );

          if (selectedConvIndex !== -1) {
            const [selectedConv] = updatedConversations.splice(
              selectedConvIndex,
              1
            );
            updatedConversations.unshift(selectedConv);
          }
        }

        return updatedConversations;
      });

      if (!conversationAlreadyExists) {
        const newConversation = {
          _id: message.conversationId,
          lastMessage: {
            text: message.text,
            sender: message.sender,
            img: message.img,
            video: message.video,
            seen: message.seen,
          },
          participants: [
            {
              _id: message.sender,
              username: message.username,
              profilePic: message.profilePic,
            },
          ],
        };

        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation({
          _id: message.conversationId,
          userID: message.sender,
          username: message.username,
          userProfilePic: message.profilePic,
        });
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1]?.sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessageAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userID,
      });
    }
    if (!socket) return;
    socket.on("messageSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversation._id) return;
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userID}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [showToast, selectedConversation.userID, selectedConversation.mock]);

  return (
    <Flex
      flex="70"
      p={2}
      bg={useColorModeValue("gray.200", "gray.dark")}
      borderRadius={"md"}
      flexDirection={"column"}
    >
      {/* message header  */}
      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Link as={RouterLink} to={`/${selectedConversation.username}`}>
          <Avatar
            cursor={"pointer"}
            src={selectedConversation.userProfilePic}
            size={"sm"}
          >
            {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
          </Avatar>
        </Link>
        <Link as={RouterLink} to={`/${selectedConversation.username}`}>
          <Text cursor={"pointer"} display={"flex"} alignItems={"center"}>
            {selectedConversation.username}{" "}
            <Image src="/verified.png" w={4} h={4} ml={1} />
          </Text>
        </Link>
        <Flex ml={"auto"} flexDirection={"row"}>
          <IoCallOutline
            size={25}
            style={{ marginRight: "10px" }}
            cursor={"pointer"}
          />
          <IoVideocamOutline size={28} cursor={"pointer"} />
        </Flex>
      </Flex>
      <Divider />

      <Flex
        key={"messagesContainer" + selectedConversation._id}
        flexDir={"column"}
        gap={4}
        p={2}
        my={4}
        height={"400px"}
        overflowY={"auto"}
      >
        {loadingMessages &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={"loading" + i}
              gap={2}
              alignItems={"center"}
              p={1}
              border={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
              </Flex>
              {i % 2 === 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {!loadingMessages &&
          messages.map((message) => (
            <Flex
              key={message._id}
              direction={"column"}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? messageEndRef
                  : null
              }
            >
              <Message
                message={message}
                ownMessage={currentUser._id === message.sender}
              />
            </Flex>
          ))}
      </Flex>

      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
