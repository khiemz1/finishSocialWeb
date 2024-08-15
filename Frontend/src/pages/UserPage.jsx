import React, { useEffect } from "react";
import UserHeader from "../components/UserHeader";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast.js";
import { useParams } from "react-router-dom";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import Posts from "../components/Posts.jsx";
import useGetUserProfile from "../hooks/useGetUserProfile.js";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom.js";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {

    const getPost = async () => {
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        // console.log(data);
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error"); // Use error.message to show the error as a string
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };
    getPost();
    
  }, [username, showToast, setPosts]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"} >
        <Spinner size="xl"/>
      </Flex>
    )
  } 
  if (!user && !loading) {
    return (
      <Flex justifyContent={"center"} >
        <p>User not found</p>
      </Flex>
    );
  }

  return (
    <Box maxW={"650px"} m={"auto"} >
      <UserHeader user={user} />
      {!fetchingPosts && posts.length === 0 && <Box mt={5} textAlign={"center"}><span >User hasn't posted anything!</span></Box>  }
      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size="xl"/>
        </Flex>
      )}

      {posts.map((post) => (
        <Posts key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </Box>
  );
}

export default UserPage;
