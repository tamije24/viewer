import ViewListSharpIcon from "@mui/icons-material/ViewListSharp";
import AssignmentSharpIcon from "@mui/icons-material/AssignmentSharp";
import CloudQueueSharpIcon from "@mui/icons-material/CloudQueueSharp";
import ConstructionSharpIcon from "@mui/icons-material/ConstructionSharp";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LegendToggleSharpIcon from "@mui/icons-material/LegendToggleSharp";

const ProjectToolbar = () => {
  return (
    <Box
      sx={{
        height: `calc(100vh - 70px)`,
        paddingTop: "15px",
        justifyContent: "center",
      }}
    >
      <IconButton aria-label="projectList" color="inherit">
        <ViewListSharpIcon fontSize="medium" color="info" />
      </IconButton>
      <IconButton aria-label="projectDetails" color="inherit">
        <CloudQueueSharpIcon fontSize="medium" color="info" />
      </IconButton>
      <IconButton aria-label="projectDetails" color="inherit">
        <AssignmentSharpIcon fontSize="medium" color="info" />
      </IconButton>
      <IconButton aria-label="projectDetails" color="inherit">
        <LegendToggleSharpIcon fontSize="medium" color="info" />
      </IconButton>
      <IconButton aria-label="projectDetails" color="inherit">
        <ConstructionSharpIcon fontSize="medium" color="info" />
      </IconButton>
    </Box>
  );
};

export default ProjectToolbar;
