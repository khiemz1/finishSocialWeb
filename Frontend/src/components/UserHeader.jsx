// src/pages/UserHeader.jsx
import {
  Avatar,
  Box,
  Flex,
  VStack,
  Text,
  Link,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem,
  useToast,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {Link as RouterLink, useParams} from "react-router-dom"
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

function UserHeader({ user }) {
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const {handleFollowUnfollow, following, updating, followersNumber, followingNumber} = useFollowUnfollow(user);
  const { username: urlUsername } = useParams()
  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      console.log("URL copied to clipboard:" + currentURL);
      showToast("Copied", "URL copied to clipboard", "success");
    });
  };
  console.log(user);

  
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>@{user.username}</Text>
            {/* <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            >
              ptit.edu
            </Text> */}
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}

          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="/zuck-avatar.png"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"}>Update profile</Button>
        </Link>
      )}
      {currentUser._id !== user._id && (
          <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
            {following ? "Unfollow" : "Follow"}
          </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignContent={"center"}></Flex>
        <Flex w={"full"} justifyContent={"space-between"}>
          <Flex gap={2} alignItems={"center"}>
            <Link color={"gray.light"}>{followersNumber} followers</Link>
            <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
            <Link color={"gray.light"}>{followingNumber ? followingNumber + " following" : ""} </Link>
          </Flex>
          <Flex>
            <Box className="icon-container">
              <BsInstagram size={24} cursor={"pointer"} />
            </Box>
            <Box className="icon-container">
              <Menu>
                <MenuButton>
                  <CgMoreO size={24} cursor={"pointer"} />
                </MenuButton>
                <Portal>
                  <MenuList bg={colorMode === "dark" ? "gray.dark" : "white"}>
                    <MenuItem
                      bg={colorMode === "dark" ? "gray.dark" : "white"}
                      onClick={copyURL}
                    >
                      Copy Link
                    </MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb={"3"}
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}>
          {currentUser.username === urlUsername ? "Your Posts" : `${urlUsername}'s Posts`}
            </Text>
        </Flex>
      </Flex>
    </VStack>
  );
}

export default UserHeader;
