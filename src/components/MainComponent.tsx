import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import ProjectToolbar from "./ProjectToolbar";
import ProjectList from "./ProjectList";

// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: "#fff",
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: "center",
//   color: theme.palette.text.secondary,
//   ...theme.applyStyles("dark", {
//     backgroundColor: "#1A2027",
//   }),
// }));

const MainComponent = () => {
  return (
    <Grid
      container
      direction="row"
      spacing={0.5}
      sx={{
        justifyContent: "flex-start",
        backgroundColor: "Window-frame",
        overflow: "auto",
      }}
    >
      <Grid
        item
        sx={{
          width: "50px",
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? "#DDDDDD" : "#323232",
        }}
      >
        <ProjectToolbar />
      </Grid>
      <Grid
        item
        sx={{
          width: `calc(100% - 70px)`,
        }}
      >
        <ProjectList />
      </Grid>
    </Grid>
  );
};

export default MainComponent;
