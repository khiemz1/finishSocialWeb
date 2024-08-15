import React, { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast';
import postsAtom from '../atoms/postsAtom';
import { useRecoilState } from 'recoil';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import Posts from '../components/Posts';

const LikePage = () => {
    const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [fetchingPosts, setFetchingPosts] = useState(true);
  useEffect(() => {

    const getPost = async () => {
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/getLikesPost`);
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
    
  }, [showToast, setPosts]);
  return (
    <Flex maxW={"700px"} flexDirection={"column"} mx={"auto"} >
    {!fetchingPosts && posts.length === 0 && <Box mt={5} textAlign={"center"}><span >You haven't likes any post!</span></Box>  }
    {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size="xl"/>
        </Flex>
      )}

      {posts.map((post) => (
        <Posts key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </Flex>
  )
}

export default LikePage