// src/pages/PostPage.jsx
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Flex,
  Text,
  Image,
  Box,
  Divider,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import Actions from "../components/Actions";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import { DeleteIcon } from "@chakra-ui/icons";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";

function PostPage() {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const res = await fetch("/api/posts/" + pid);
        const data = await res.json();
        if (data.error) {
          console.log(data.error);
          return;
        }
        setPosts([data]);
        console.log(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };

    getPost();
  }, [showToast, pid, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }
      const res = await fetch(`/api/posts/delete/${currentPost._id}`, {
        method: "DELETE",
      })
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted successfully", "success");
      navigate("/" + user.username);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  }

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) return null;

  return (
    <Box maxW={"600px"} m={"auto"}>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user.profilePic} size={"md"} name="Mark Zuckerberg" />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.username}
            </Text>
            <Image src="/verified.png" w={"4"} h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"xs"}
            width={36}
            textAlign={"right"}
            color={"gray.light"}
          >
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>
          {currentUser?._id === user?._id && (
            <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} />
          )}
        </Flex>
      </Flex>

      <Text ml={10} my={3}>{currentPost.text}</Text>
      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}
          maxW={"60%"}
          m={"auto"}
        >
          <Image src={currentPost.img} w={"full"} />
        </Box>
      )}
      {currentPost.video && (
            <Box
              borderRadius={6}
              overflow={"hidden"}
              border={"1px solid"}
              borderColor={"gray.light"}
              w={"60%"}
              m={"auto"}
            >
              <video
                    src={currentPost.video}
                    alt="Selected video"
                    controls
                    style={{
                      width: "100%",
                    height: "auto",
                    maxHeight: "300px",
                    objectFit: "contain",
                    }}
                  />
            </Box>
          )}

          {currentPost.repost && (
            <Link to={`/${currentPost.repost.postedBy.username}/post/${currentPost.repost._id}`}>
            <Flex gap={3} m={"auto"} py={5} maxW={"80%"} padding={6}
            border={"1px solid"} 
            borderColor={"gray.light"}
            borderRadius={6}>
            <Flex flexDirection={"column"} alignItems={"center"}>
                <Avatar
                  size='md'
                  src={currentPost.repost.postedBy.profilePic}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${currentPost.repost.postedBy.username}`);
                  }}
                />
              </Flex>
              <Flex flex={1} flexDirection={"column"} gap={2}>
                <Flex justifyContent={"space-between"} w={"full"}>
                  <Flex w={"full"} alignItems={"center"}>
                    <Text
                      fontSize={"sm"}
                      fontWeight={"bold"}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${currentPost.repost.postedBy.username}`);
                      }}
                    >
                      {currentPost.repost.postedBy.username}
                    </Text>
                    <Image src="/verified.png" w={4} h={4} ml={1} />
                  </Flex>
                  <Flex gap={4} alignItems={"center"}>
                      <Text
                        fontSize={"xs"}
                        width={36}
                        textAlign={"right"}
                        color={"gray.light"}
                      >
                        {formatDistanceToNow(new Date(currentPost.repost.createdAt))}{" "}
                        ago
                      </Text>
                    </Flex>
                </Flex>
      
                <Text fontSize={"sm"}>{currentPost.repost.text}</Text>
                {currentPost.repost.img && (
                  <Box
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.light"}
                  >
                    <Image src={currentPost.repost.img} w={"full"} />
                  </Box>
                )}
                {currentPost.repost.video && (
                  <Box
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.light"}
                  >
                    <video
                          src={currentPost.repost.video}
                          alt="Selected video"
                          controls
                          style={{
                            width: "100%",
                          height: "auto",
                          maxHeight: "300px",
                          objectFit: "contain",
                          }}
                        />
                  </Box>
                )}
      
              </Flex>
            </Flex>
          </Link>
          )}

      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>

      {/* <Divider my={4}></Divider>
      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>🤘</Text>
          <Text color={"gray.light"}> Get the app to like, reply and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex> */}
      <Divider my={4}></Divider>
      {currentPost.replies.map((reply) => (
        <Comment
        key={reply._id}
        reply={reply}
        lastReply={reply._id === currentPost.replies[0]._id}
        />
      ))}
      
    </Box>
  );
}

export default PostPage;
