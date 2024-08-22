import {
  Flex,
  useColorMode,
  Image,
  Button,
  Box,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
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
import { useSocket } from "../context/SocketContext";
import messageSound from "../assets/sounds/message.mp3";
import { FaRegBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const Header = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const { socket } = useSocket();
  const [notifys, setNotifys] = useState([]);
 
  const seenNoify = () => {
    const notSeenNotifys = notifys.filter(notify => !notify.seen).length;
    if (notSeenNotifys > 0) {
      socket.emit("markNotificationAsSeen", {
        userId: user._id,
      });
      setNotifys((prevNotifys) =>
        prevNotifys.map((notify) => ({ ...notify, seen: true }))
      );
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("NotificationSeen", ({ userId }) => {
        setNotifys((prev) => {
          if (!prev.seen) prev.seen = true;
          return prev;
        });
    });
  }, [socket,notifys]);

  useEffect(() => {
    const getNotifications = async () => {
      setNotifys([]);
      try {
        const res = await fetch(`/api/posts/getNotifys`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setNotifys(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };

    getNotifications();
  }, [showToast]);

  useEffect(() => {
    if (!socket) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    socket.on("newNotification", (notify) => {
      console.log("newNotification", notify);
      setNotifys((prevNotifys) => [...prevNotifys, notify]);

      if (!document.hasFocus()) {
        const audio = new Audio(messageSound);
        audio.play();
        if (Notification.permission === "granted") {
          new Notification("New Notification", {
            body: `${notify.username} ${notify.type} your post`,
            icon: "/logo_K.png",
            duration: 500,
          });
        }
      } else {
        const audio = new Audio(messageSound);
        audio.play();
      }
    });

    return () => socket.off("newNotification");
  }, [socket]);

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
                  <MenuItem
                    bg={colorMode === "dark" ? "gray.dark" : "white"}
                    onClick={() => navigate("/setting")}
                  >
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
        {user && (
          <Box position={"fixed"} top={5} right={"150px"} >
            <Menu>
              <MenuButton 
                onClick={seenNoify}>
                <FaRegBell cursor={"pointer"} size={22} />
              </MenuButton>
              {notifys.filter(notify => !notify.seen).length > 0 && (
                <Box
                  position="absolute"
                  top="-2px"
                  right="-8px"
                  background="red"
                  borderRadius="full"
                  width="15px"
                  height="15px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="12px"
                >
                  {notifys.filter(notify => !notify.seen).length}
                </Box>
              )}
              <Portal>
                <MenuList bg={colorMode === "dark" ? "gray.dark" : "white"}
                maxH="280px"
                overflowY={"auto"}
                >
                  {notifys.length > 0 &&
                    notifys.map((notify) => (
                      <MenuItem
                        key={notify._id}
                        bg={colorMode === "dark" ? "gray.dark" : "white"}
                        onClick={() =>
                          navigate(`/${user.username}/post/${notify.postId}`)
                        }
                      >
                        <Box
                          p={2}
                          borderWidth="1px"
                          borderRadius="lg"
                          boxShadow="sm"
                          maxW="sm"
                          mx={"auto"}
                          bg={colorMode === "dark" ? "white" : "gray.dark"}
                          color={colorMode === "dark" ? "black" : "white"}
                        >
                          <Flex align="center">
                            <Avatar
                              name= {notify.username}
                              src={notify.profilePic} // Thay bằng link ảnh thật của người dùng
                              size="md"
                              mr={4}
                              mb={1}
                            />
                            
                            <Box flex="1">
                              <Text fontWeight="bold">{notify.username}</Text>
                              <Text>{notify.type} your post</Text>
                              <Text fontSize="10px" color="blue">{formatDistanceToNow(new Date(notify.createdAt))} ago</Text>
                            </Box>
                          </Flex>
                        </Box>
                      </MenuItem>
                    ))}
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        )}
      </Box>

      <Box style={{ height: "100px" }}></Box>
    </>
  );
};

export default Header;
