import { Fragment, useEffect, useState } from "react";
import projectService, { Project } from "../services/project-service";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProjectCard from "./ProjectCard";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import AddHomeIcon from "@mui/icons-material/AddHome";

interface Props {
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
}

const ProjectList = ({ onSelectProject, onAddProject }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const { request, cancel } = projectService.getAllProjects();

    request
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
        setError(err.message);
        setLoading(false);
      });
    return () => cancel();
  }, []);

  const handleSelectProject = (project_id: number) => {
    onSelectProject(
      projects.filter(
        (project: Project) => project.project_id === project_id
      )[0]
    );
  };

  const handleDeleteProject = (project_id: number) => {
    const originalProjects = [...projects];
    projectService
      .deleteProject(project_id)
      .then((_res) => {
        setProjects(
          projects.filter(
            (project: Project) => project.project_id !== project_id
          )
        );
      })
      .catch((err) => {
        setError(err.message);
        setProjects(originalProjects);
      });
  };

  if (error) {
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 1, mb: 2 }}>
        <Typography
          variant="overline"
          component="div"
          color="firebrick"
          sx={{ flexGrow: 1 }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Fragment>
      <Grid
        container
        sx={{
          display: "flex",
          mt: 10,
          ml: 1,
          mb: 2,
          justifyItems: "end",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Grid item>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            List of Analysis
          </Typography>
        </Grid>
        <Grid item>
          <Button
            startIcon={<AddHomeIcon color="primary" />}
            onClick={onAddProject}
          >
            Add New Analysis
          </Button>
        </Grid>
      </Grid>

      <Grid
        container
        direction="row"
        sx={{ mt: 1, ml: 1, mr: 1, mb: 10 }}
        spacing={0.5}
      >
        {!isLoading ? (
          projects.map((project) => (
            <Grid item key={project.project_id} xs={12}>
              <ProjectCard
                project={project}
                onSelectProject={handleSelectProject}
                onDeleteProject={handleDeleteProject}
              />
            </Grid>
          ))
        ) : (
          <ProjectListSkeleton />
        )}
      </Grid>
    </Fragment>
  );
};

export default ProjectList;

const ProjectListSkeleton = () => {
  return (
    <Grid container direction="row" margin={1.0} spacing={0.5}>
      <Grid item xs={12} key={1}>
        <ProjectCardSkeleton />
      </Grid>
      <Grid item xs={12} key={2}>
        <ProjectCardSkeleton />
      </Grid>
    </Grid>
  );
};

const ProjectCardSkeleton = () => {
  return (
    <Card elevation={3}>
      <CardHeader
        title={<Skeleton variant="text" />}
        subheader={<Skeleton variant="text" />}
      />

      <CardContent>
        <Skeleton variant="rounded" />
      </CardContent>
    </Card>
  );
};
