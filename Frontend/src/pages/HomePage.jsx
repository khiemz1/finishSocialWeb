import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Posts from "../components/Posts";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if (data.error) {
          console.log(data.error);
          return;
        }
        // console.log(data);
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);
  return (
    <>
      <Flex gap="10" alignItems={"flex-start"}>
        <Box flex={{ base: 2, md: 5, lg: 20, xl: 45 }}></Box>
        <Box flex={{ base: 70, md: 50, lg: 40 }} maxW={"600px"}>
        {!loading && posts.length === 0 && (
          <Box textAlign={"center"}>
        <h1>No posts available!!!</h1>
          </Box>
        )}
          {loading && (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}

          {posts.map((post) => (
            <Posts key={post._id} post={post} postedBy={post.postedBy} />
          ))}
        </Box>
        <Box
          flex={{ lg: 15, xl: 20 }}
          display={{
            base: "none",
            lg: "block",
          }}
        ></Box>
        <Box
          flex={15}
          display={{
            base: "none",
            xl: "block",
          }}
        >
          <SuggestedUsers />
        </Box>
        <Box flex={{ base: 10, lg: 5 }}></Box>
      </Flex>
      
    </>
  );
};

export default HomePage;
