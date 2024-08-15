import { Flex, useColorMode, Image, Button, Box, Menu, MenuButton, Portal, MenuList, MenuItem } from "@chakra-ui/react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { GoHome, GoHomeFill } from "react-icons/go";
import { Link as RouterLink } from "react-router-dom";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { GiMoon } from "react-icons/gi";
import {
  IoChatbubbleEllipsesOutline,
  IoChatbubbleEllipses,
} from "react-icons/io5";
import { TbHexagonLetterK } from "react-icons/tb";
import { IoSearchOutline, IoSearchSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";

const Header = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      localStorage.removeItem("user-threads");
      setUser(null);
      navigate("/");
    } catch (error) {
      showToast("Error", error, "error");
    }
  };
  return (
    <>
      <Box
        bg={colorMode === "dark" ? "rgba(16, 16, 16, 0.95)" : "white"}
        position={"fixed"}
        top={0}
        paddingBottom={4}
        left={0}
        right={0}
        zIndex={1} // Ensures the header is above other content
        m={"auto"}
      >
        {/* <Image
        cursor={"pointer"}
        alt="logo"
        position={"fixed"}
        top={5}
        left={7}
        w={8}
        src={colorMode === "dark" ? "/night.png" : "/day.png"}
        onClick={toggleColorMode}
      /> */}
        <Box position={"fixed"} top={4} left={20} m={"auto"}>
          <TbHexagonLetterK size={45} />
        </Box>

        <Flex
          justifyContent={"space-around"}
          pt={3}
          alignItems={"center"} // Ensures the header is above other content
          m={"auto"}
          maxW={{ base: "250px", md: "480px", xl: "700px" }}
          paddingTop={4}
        >
          {user && (
            <Link as={RouterLink} to="/">
              {location.pathname === "/" ? (
                <GoHomeFill size={24} />
              ) : (
                <GoHome size={24} />
              )}
            </Link>
          )}
          {user && (
            <Link as={RouterLink} to="/search">
              {location.pathname === "/search" ? (
                <IoSearchSharp size={28} />
              ) : (
                <IoSearchOutline size={24} />
              )}
            </Link>
          )}
          {user && (
            <Link as={RouterLink} to="/chat">
              {location.pathname === "/chat" ? (
                <IoChatbubbleEllipses size={24} />
              ) : (
                <IoChatbubbleEllipsesOutline size={24} />
              )}
            </Link>
          )}

          {user && (
            <Link as={RouterLink} to={`/likes`}>
              {location.pathname === `/likes` ? (
                <IoMdHeart size={24} />
              ) : (
                <IoMdHeartEmpty size={24} />
              )}
            </Link>
          )}
          {user && (
            <Link as={RouterLink} to={`/${user.username}`}>
              {location.pathname === `/${user.username}` ? (
                <FaUserCircle size={24} />
              ) : (
                <FaRegUserCircle size={24} />
              )}
            </Link>
          )}
        </Flex>
        {user && (
          <Box position={"fixed"} top={5} right={"120px"}>
            <Menu>
              <MenuButton>
                <IoSettingsOutline cursor={"pointer"} size={22} />
              </MenuButton>
              <Portal>
                <MenuList bg={colorMode === "dark" ? "gray.dark" : "white"}>
                  <MenuItem bg={colorMode === "dark" ? "gray.dark" : "white"}
                  onClick={() => navigate("/setting")}>
                    Setting
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        )}
        <Button
          position={"fixed"}
          top={2}
          right={"20px"}
          size={"md"}
          onClick={handleLogout}
        >
          <FiLogOut />
        </Button>
        <Box position={"fixed"} top={5} right={"90px"}>
          <GiMoon cursor={"pointer"} onClick={toggleColorMode} size={20} />
        </Box>
      </Box>

      <Box style={{ height: "100px" }}></Box>
    </>
  );
};

export default Header;
