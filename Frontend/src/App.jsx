import { Box, Button, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatPost from "./components/CreatPost";
import ChatPage from "./pages/ChatPage";
import LikePage from "./pages/LikePage";
import SearchPage from "./pages/SearchPage";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const user = useRecoilValue(userAtom);
  const {pathname} = useLocation();

  return (
    <Box position={"relative"} w={"full"} >
      <Container maxW={"full"}>
        <Header />
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/" />}
          />
          <Route
            path="/update"
            element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/setting"
            element={user ? <ChangePassword /> : <Navigate to="/auth" />}
          />
          
          <Route path="/likes" element={user ?<LikePage /> : <Navigate to="/auth" />} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route
            path="/chat"
            element={user ? <ChatPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/search"
            element={user ? <SearchPage /> : <Navigate to="/auth" />}
          />
          
          <Route
            path="/:username"
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatPost />
                </>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
