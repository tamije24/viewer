import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Project } from "../services/project-service";

interface Props {
  project: Project | null;
}

const ProjectSettings = ({ project }: Props) => {
  return (
    <Box sx={{ display: "flex", marginTop: 10, marginLeft: 1 }}>
      {project ? (
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Project Settings - {project.project_id}
        </Typography>
      ) : (
        <Typography
          variant="subtitle1"
          sx={{ flexGrow: 1, color: "cadetblue" }}
        >
          Please select a project from the Project List
        </Typography>
      )}
    </Box>
  );
};

export default ProjectSettings;
