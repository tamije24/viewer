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
import { Autocomplete, Grid, TextField, Typography } from "@mui/material";

// import ChromeReaderModeIcon from "@mui/icons-material/ChromeReaderMode";
// import MicrowaveIcon from "@mui/icons-material/Microwave";
// import ViewArrayIcon from "@mui/icons-material/ViewArray";
// import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import WebIcon from "@mui/icons-material/Web";
import WebAssetIcon from "@mui/icons-material/WebAsset";

export interface AccessCodes {
  access: string;
  refresh: string;
}

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [sidebarStatus, setSidebarStatus] = useState(true);
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

  const displayPoints = [
    "500",
    "1000",
    "1500",
    "2000",
    "2500",
    "3000",
    "3500",
    "4000",
  ];
  const [currentUser, setCurrentUser] = useState({ id: 0, name: "" });
  const [pointCount, setPointCount] = useState<string | null>(displayPoints[0]);

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
            <MainComponent
              pointCount={pointCount === null ? 0 : parseInt(pointCount)}
              sidebarStatus={sidebarStatus}
            />
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
            borderRadius: 1,
          }}
          elevation={3}
        >
          <Grid
            container
            direction="row"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Grid item xs={2.5}>
              <BottomNavigation
                showLabels
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "left",
                  // bgcolor: "background.default",
                  //bgcolor: "red",
                  color: "text.primary",
                  //    borderRadius: 1,
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
                <BottomNavigationAction
                  sx={{ ml: 1 }}
                  label={sidebarStatus ? "Show side bar" : "Hide side bar"}
                  value="sidebar"
                  icon={sidebarStatus ? <WebIcon /> : <WebAssetIcon />}
                  onClick={() => setSidebarStatus(!sidebarStatus)}
                />
              </BottomNavigation>
            </Grid>
            <Grid
              item
              xs={1.5}
              display="flex"
              justifyContent="flex-start"
              sx={{
                mt: 1.5,
                ml: 5,
              }}
            >
              <Autocomplete
                disablePortal
                size="small"
                value={pointCount}
                defaultValue={displayPoints[0]}
                onChange={(_event: any, newValue: string | null) => {
                  setPointCount(newValue);
                }}
                options={displayPoints}
                sx={{ width: 150 }}
                renderInput={(params) => (
                  <TextField {...params} label="Display points" />
                )}
              />
            </Grid>
            <Grid
              item
              xs={7}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                pr: 2,
                pb: 1,
                bgcolor: "",
              }}
            >
              <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                Copyright © 2024 Tenaga Nasional Berhad. All Rights Reserved.
              </Typography>
            </Grid>
            {/* <Grid item>
              <ChromeReaderModeIcon />
              <MicrowaveIcon />
              <ViewArrayIcon />
              <ViewSidebarIcon />
            </Grid> */}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;
