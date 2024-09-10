import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import BorderFavoriteIcon from "@mui/icons-material/StarBorderSharp";
import FavoriteIcon from "@mui/icons-material/StarSharp";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";

import ExpandMore from "./ExpandMore";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import { Project } from "../services/project-service";
import { ComtradeFile } from "../services/comtrade-file-service";

//import AddchartIcon from '@mui/icons-material/Addchart';

interface Props {
  project: Project;
  onSelectProject: (project_id: number) => void;
  onDeleteProject: (project_id: number) => void;
  onStarProject: (project: Project) => void;
}

const ProjectCard = ({
  project,
  onSelectProject,
  onDeleteProject,
  onStarProject,
}: Props) => {
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
          sx={{ paddingBottom: 0.5 }}
        />
      </CardActionArea>
      <CardActions disableSpacing sx={{ ml: 0.5, padding: 0 }}>
        <IconButton
          aria-label="add to favorites"
          size="small"
          onClick={() => {
            project.favorite = !project.favorite;
            onStarProject(project);
          }}
        >
          {project.favorite ? (
            <FavoriteIcon fontSize="small" sx={{ color: "forestgreen" }} />
          ) : (
            <BorderFavoriteIcon
              fontSize="small"
              sx={{ color: "forestgreen" }}
            />
          )}
        </IconButton>
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => {
            // TODO confirm delete before doing actual delete
            onDeleteProject(project.project_id);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ color: "darkred" }} />
        </IconButton>
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
        // sx={{
        //   backgroundColor: (theme) =>
        //     theme.palette.mode === "light" ? "#DDDDDD" : "#323232",
        // }}
        >
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            {project.notes}
          </Typography>
          <Typography sx={{ marginBottom: 2 }}>Files:</Typography>
          {project.files.length !== 0 ? (
            project.files.map((file: ComtradeFile) => (
              <Box key={file.file_id}>
                <Stack
                  display="flex"
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{ marginBottom: 1 }}
                >
                  <Typography gutterBottom width="100px" variant="body2">
                    {file.station_name}
                  </Typography>
                  <Button href={file.cfg_file} endIcon={<DownloadIcon />}>
                    CFG File
                  </Button>
                  <Button href={file.dat_file} endIcon={<DownloadIcon />}>
                    DAT File
                  </Button>
                </Stack>
                <Divider />
              </Box>
            ))
          ) : (
            <Typography variant="overline">No Files uploaded</Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ProjectCard;
