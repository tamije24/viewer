import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachmentIcon from "@mui/icons-material/Attachment";
import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";
import CloudDownloadSharpIcon from "@mui/icons-material/CloudDownloadSharp";
import BackupIcon from "@mui/icons-material/Backup";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PlaceSharpIcon from "@mui/icons-material/PlaceSharp";

import projectService, { Project } from "../services/project-service";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { IconButton, styled } from "@mui/material";
import comtradeFileService, {
  ComtradeFile,
} from "../services/comtrade-file-service";

interface Props {
  project: Project;
  onAddFiles: () => void;
}

const ProjectDetails = ({ project, onAddFiles }: Props) => {
  const [error, setError] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [linenameError, setLinenameError] = useState(false);
  const [linenameErrorMessage, setLinenameErrorMessage] = useState("");
  const [terminalsError, setTerminalsError] = useState(false);
  const [terminalsErrorMessage, setTerminalsErrorMessage] = useState("");

  const [cfgSelected, setCfgSelected] = useState(false);
  const [datSelected, setDatSelected] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const updatedProject: Project = {
      project_id: project?.project_id,
      project_name: project?.project_name,
      afa_case_id: String(data.get("afacaseid")),
      line_name: String(data.get("linename")),
      no_of_terminals: Number(data.get("terminals")),
      notes: String(data.get("notes")),
      favorite: project.favorite,
      user: project.user,
      files: [...project.files],
    };

    if (linenameError || terminalsError) return;

    projectService
      .updateProject(updatedProject)
      .then(() => setFormDirty(false))
      .catch((err) => {
        setError(err.message);
      });
  };

  const handleCfgFile = () => {
    setCfgSelected(true);
  };

  const handleDatFile = () => {
    setDatSelected(true);
  };

  const handleNewFileAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cfgFile = document.getElementById(
      "cfg_file_button"
    ) as HTMLInputElement;
    const datFile = document.getElementById(
      "dat_file_button"
    ) as HTMLInputElement;

    if (cfgFile.files !== null && datFile.files !== null)
      comtradeFileService
        .createComtradeFile(
          project.project_id,
          cfgFile.files[0],
          datFile.files[0]
        )
        .then((_res) => {
          onAddFiles();
        })
        .catch((err) => {
          setError(err.message);
        });
  };

  const handleFileDelete = (file_id: number) => {
    // TODO confirm delete before doing actual delete
    comtradeFileService
      .deleteComtradeFile(project.project_id, file_id)
      .then((_res) => {
        onAddFiles();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const validateInputs = () => {
    const linename = document.getElementById("linename") as HTMLInputElement;
    const terminals = document.getElementById("terminals") as HTMLInputElement;

    let isValid = true;

    if (!linename.value) {
      setLinenameError(true);
      setLinenameErrorMessage("Line name required");
      isValid = false;
    } else {
      setLinenameError(false);
      setLinenameErrorMessage("");
    }

    if (!terminals.value) {
      setTerminalsError(true);
      setTerminalsErrorMessage("No of terminals required");
      isValid = false;
    } else {
      setTerminalsError(false);
      setTerminalsErrorMessage("");
    }
    return isValid;
  };

  if (!project) {
    return (
      <Card
        sx={{
          mt: 10,
          ml: 2,
          mb: 0.5,
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <BarChartIcon />
            </Avatar>
          }
          title="Project not selected"
          subheader={
            <Typography sx={{ fontSize: 12 }}>
              Please select a protect to view / edit details
            </Typography>
          }
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent sx={{ height: "300px" }} />
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          mt: 10,
          ml: 2,
          mb: 0.5,
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <PlaceSharpIcon />
            </Avatar>
          }
          title={project?.project_name}
          subheader={
            <Typography sx={{ fontSize: 12 }}>
              Click on fields below to edit details
            </Typography>
          }
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent>
          <Grid
            container
            component="form"
            onSubmit={handleSubmit}
            onChange={() => {
              setFormDirty(true);
            }}
            noValidate
            spacing={0.5}
          >
            <Grid item xs={3}>
              <TextField
                margin="normal"
                required
                id="afacaseid"
                type="text"
                label="AFA Case ID"
                name="afacaseid"
                autoComplete="afacaseid"
                fullWidth
                autoFocus
                color="secondary"
                sx={{ ariaLabel: "afacaseid" }}
                value={project?.afa_case_id}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                error={linenameError}
                helperText={linenameErrorMessage}
                margin="normal"
                required
                id="linename"
                type="text"
                label="Line Name"
                name="linename"
                autoComplete="linename"
                fullWidth
                autoFocus
                color={linenameError ? "error" : "primary"}
                defaultValue={project?.line_name}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                error={terminalsError}
                helperText={terminalsErrorMessage}
                margin="normal"
                required
                id="terminals"
                type="number"
                label="No of Terminals"
                name="terminals"
                autoComplete="terminals"
                fullWidth
                autoFocus
                color={terminalsError ? "error" : "primary"}
                defaultValue={project?.no_of_terminals}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                id="notes"
                type="text"
                multiline={true}
                label="Notes"
                name="notes"
                autoComplete="notes"
                fullWidth
                autoFocus
                color="primary"
                sx={{ ariaLabel: "notes" }}
                defaultValue={project?.notes}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                //justifyContent: "space-around",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{ ml: 0 }}
                disabled={!formDirty}
                onClick={validateInputs}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Typography
              component="h1"
              variant="overline"
              align="left"
              sx={{ color: "red" }}
            >
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 0.5,
          ml: 2,
          mb: 10,
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ m: 1, bgcolor: "green" }}>
              <AttachmentIcon />
            </Avatar>
          }
          title="Related Files"
          subheader={
            <Typography sx={{ fontSize: 12 }}>
              Click on Add File buttons to add more files to this project
            </Typography>
          }
          sx={{ paddingBottom: 1, height: 60, borderBottom: 0.5 }}
        />
        <CardContent>
          {project.files.length !== 0 ? (
            project.files.map((file: ComtradeFile) => (
              <Box key={file.file_id}>
                <Stack
                  display="flex"
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{ ml: 2 }}
                >
                  <AttachFileSharpIcon />
                  <Typography gutterBottom width="100px" variant="subtitle1">
                    {file.station_name}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "secondary.main" }}
                    href={file.cfg_file}
                    endIcon={<CloudDownloadSharpIcon />}
                  >
                    CFG File
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "success.main" }}
                    href={file.dat_file}
                    endIcon={<CloudDownloadSharpIcon />}
                  >
                    DAT File
                  </Button>
                  <IconButton
                    aria-label="delete"
                    size="large"
                    onClick={() => handleFileDelete(file.file_id)}
                  >
                    <DeleteForeverIcon fontSize="large" />
                  </IconButton>
                </Stack>
                <Divider variant="inset" />
              </Box>
            ))
          ) : (
            <Typography variant="overline">No Files uploaded</Typography>
          )}
        </CardContent>
        <CardActions
          sx={{
            bgcolor: "khaki",
            mb: 0,
          }}
        >
          <form onSubmit={handleNewFileAdd}>
            <Stack
              display="flex"
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{ ml: 4, mt: 1, mb: 1 }}
            >
              <Typography variant="subtitle1" sx={{ color: "black" }}>
                Add Files
              </Typography>
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                sx={{ color: "black", borderColor: "black" }}
                endIcon={<BackupIcon />}
              >
                <Typography variant="body2" sx={{ color: "black" }}>
                  Select Cfg File
                </Typography>
                <VisuallyHiddenInput
                  id="cfg_file_button"
                  type="file"
                  onChange={handleCfgFile}
                  multiple={false}
                />
              </Button>
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                sx={{ color: "black", borderColor: "black" }}
                endIcon={<BackupIcon />}
              >
                <Typography variant="body2" sx={{ color: "black" }}>
                  Select Dat File
                </Typography>
                <VisuallyHiddenInput
                  id="dat_file_button"
                  type="file"
                  onChange={handleDatFile}
                  multiple={false}
                />
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!cfgSelected || !datSelected}
                endIcon={<FileUploadIcon />}
              >
                <Typography variant="body2">Upload Selected Files</Typography>
              </Button>
            </Stack>
          </form>
        </CardActions>
      </Card>
    </>
  );
};
export default ProjectDetails;

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
