import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CardActions from "@mui/material/CardActions";

import ExpandMore from "./ExpandMore";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import { Project } from "../services/project-service";
import { ComtradeFile } from "../services/comtrade-file-service";

interface Props {
  project: Project;
  onSelectProject: (project_id: number) => void;
}

const ProjectCard = ({ project, onSelectProject }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card elevation={3}>
      <CardActionArea
        onClick={() => {
          onSelectProject(project.project_id);
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              variant="circular"
              sx={{ bgcolor: "secondary.main", width: 30, height: 30 }}
              aria-label="AFA case id"
            >
              <Typography sx={{ fontSize: 16 }}>
                {project.line_name[0].toUpperCase()}
              </Typography>
            </Avatar>
          }
          title={project.line_name}
          subheader={project.project_name}
          sx={{ paddingBottom: 0 }}
        />
      </CardActionArea>
      <CardActions disableSpacing sx={{ ml: 0.5, padding: 0, height: "20px" }}>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? "#EEEEEE" : "#323232",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 0.5 }}
          >
            NOTES:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            {project.notes}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 0.5 }}
          >
            STATIONS:
          </Typography>
          {project.files.length !== 0 ? (
            project.files.map((file: ComtradeFile) => (
              <Box key={file.file_id}>
                <Stack
                  display="flex"
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{ marginBottom: 0.5 }}
                >
                  <Typography gutterBottom width="100px" variant="body2">
                    {file.station_name}
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    {String(file.start_time_stamp)}
                  </Typography>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography variant="overline">No Stations added</Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ProjectCard;
