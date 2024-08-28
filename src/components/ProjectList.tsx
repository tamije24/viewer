import Typography from "@mui/material/Typography";
import useProjects from "../hooks/useProjects";

const ProjectList = () => {
  const { projects, error } = useProjects();

  return (
    <>
      {error && (
        <Typography
          variant="overline"
          component="div"
          color="firebrick"
          sx={{ flexGrow: 1 }}
        >
          {error}
        </Typography>
      )}
      <ul>
        {projects.map((project) => (
          <li key={project.project_id}>{project.project_name}</li>
        ))}
      </ul>
    </>
  );
};

export default ProjectList;
