import AccountCircle from "@mui/icons-material/AccountCircle";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/LogoutSharp";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AdbSharpIcon from "@mui/icons-material/AdbSharp";

interface User {
  id: number;
  name: string;
}

interface Props {
  user: User;
  onLogoutRequest: () => void;
}

const TopBar = ({ user, onLogoutRequest }: Props) => {
  const onLogoutClick = () => {
    // TODO: First confirm if user wants to logout
    onLogoutRequest();
  };

  return (
    <Box
      sx={{
        flexgrow: 1,
        p: 0,
      }}
    >
      <AppBar
        position="fixed"
        enableColorOnDark
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <AdbSharpIcon sx={{ ml: 0, mr: 2 }} />
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Signal Analyser 4.0
          </Typography>

          {user.id !== 0 && (
            <div>
              <Typography
                variant="overline"
                component="span"
                sx={{ flexGrow: 1, mr: 1 }}
              >
                {user.name}
              </Typography>
              <IconButton
                size="small"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <IconButton
                aria-label="logout"
                color="inherit"
                onClick={onLogoutClick}
              >
                <LogoutIcon />
              </IconButton>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default TopBar;
