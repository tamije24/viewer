import axios from "axios";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AccessCodes } from "../App";
import { useState } from "react";

interface Props {
  onAccessCodeReceive: (accessCodes: AccessCodes) => void;
}

// const defaultTheme = createTheme();

const SignIn = ({ onAccessCodeReceive }: Props) => {
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const user = {
      username: data.get("username"),
      password: data.get("password"),
    };

    if (usernameError || passwordError) return;

    // TODO: have to convert this to calling using apiClient
    axios
      .post(
        "https://signal-analyser-prod-f706849603dd.herokuapp.com/auth/jwt/create",
        // "https://127.0.0.1/auth/jwt/create",
        user
      )
      .then((response) => {
        const accessCodes: AccessCodes = {
          access: response.data["access"],
          refresh: response.data["refresh"],
        };
        onAccessCodeReceive(accessCodes);
      })
      .catch((err) => {
        if (err.response.status === 401)
          setError("Incorrect username or password");
        else setError(err.message);
      });
  };

  const validateInputs = () => {
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    // TODO: can add more validations for username and password later

    if (!username.value) {
      setUsernameError(true);
      setUsernameErrorMessage("Please enter the username");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password.value) {
      setPasswordError(true);
      setPasswordErrorMessage("Please enter the password");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            error={usernameError}
            helperText={usernameErrorMessage}
            margin="normal"
            required
            fullWidth
            id="username"
            type="text"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            color={usernameError ? "error" : "primary"}
            sx={{ ariaLabel: "username" }}
          />
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            color={passwordError ? "error" : "primary"}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={validateInputs}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
          </Grid>

          {error && (
            <Grid container sx={{ mt: 3, mb: 2 }}>
              <Grid item xs>
                <Typography
                  component="h1"
                  variant="overline"
                  align="left"
                  sx={{ color: "red" }}
                >
                  {error}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SignIn;
