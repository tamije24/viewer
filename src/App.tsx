import { useEffect, useMemo, useState } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Box from "@mui/material/Box";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import apiClient from "./services/api-client";

import MainComponent from "./components/MainComponent";
import SignIn from "./components/SignIn";
import TopBar from "./components/TopBar";
import Paper from "@mui/material/Paper";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

export interface AccessCodes {
  access: string;
  refresh: string;
}

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const [currentUser, setCurrentUser] = useState({ id: 0, name: "" });
  useEffect(() => {
    if (localStorage.getItem("token")) getUserData();
  }, []);

  const getUserData = () => {
    // GET LOGGED IN USER DATA
    apiClient
      .get("/auth/users/me")
      .then((response) => {
        setCurrentUser({
          id: response.data["id"],
          name: response.data["username"],
        });
      })
      .catch
      // TODO: Handle error
      ();
  };

  const handleAccessCodeReceive = (newAccessCodes: AccessCodes) => {
    localStorage.setItem("token", newAccessCodes.access);
    localStorage.setItem("refreshToken", newAccessCodes.refresh);
    getUserData();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CssBaseline />
        <TopBar
          user={currentUser}
          onLogoutRequest={() => {
            setCurrentUser({ id: 0, name: "" });
            localStorage.setItem("token", "");
            localStorage.setItem("refreshToken", "");
          }}
        />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[800],
            height: "100vh",
            overflow: "auto",
          }}
        >
          {currentUser.id !== 0 ? (
            <MainComponent />
          ) : (
            <SignIn onAccessCodeReceive={handleAccessCodeReceive} />
          )}
        </Box>

        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            // zIndex: (theme) => theme.zIndex.drawer + 1,
            zIndex: 100,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "left",
              bgcolor: "background.default",
              color: "text.primary",
              borderRadius: 1,
              paddingLeft: "10px",
            }}
          >
            <BottomNavigationAction
              sx={{ ml: 1 }}
              label={`${theme.palette.mode} mode`}
              value="recents"
              icon={
                theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )
              }
              onClick={colorMode.toggleColorMode}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;
