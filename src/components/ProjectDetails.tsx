import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachmentIcon from "@mui/icons-material/Attachment";
//import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";
import BackupIcon from "@mui/icons-material/Backup";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PlaceSharpIcon from "@mui/icons-material/PlaceSharp";
import Skeleton from "@mui/material/Skeleton";

import projectService, { Project } from "../services/project-service";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
} from "@mui/material";
import comtradeFileService, {
  ComtradeFile,
} from "../services/comtrade-file-service";

let cfgfile_element: HTMLInputElement;
let datfile_element: HTMLInputElement;
const signal_list = [""];
const digital_signal_list = [""];

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

  const [cfgFileName, setCfgFileName] = useState("Select CFG File");
  const [datFileName, setDatFileName] = useState("Select DAT File");
  const [fileAdding, setFileAdding] = useState(false);
  const [fileAddMessage, setFileAddMessage] = useState(
    "Select COMTRADE files to add station"
  );

  const [iaChannelErrorMsg, setIaChannelErrorMsg] = useState("");
  const [ibChannelErrorMsg, setIbChannelErrorMsg] = useState("");
  const [icChannelErrorMsg, setIcChannelErrorMsg] = useState("");
  const [vaChannelErrorMsg, setVaChannelErrorMsg] = useState("");
  const [vbChannelErrorMsg, setVbChannelErrorMsg] = useState("");
  const [vcChannelErrorMsg, setVcChannelErrorMsg] = useState("");

  const [iaChannelError, setIaChannelError] = useState(false);
  const [ibChannelError, setIbChannelError] = useState(false);
  const [icChannelError, setIcChannelError] = useState(false);
  const [vaChannelError, setVaChannelError] = useState(false);
  const [vbChannelError, setVbChannelError] = useState(false);
  const [vcChannelError, setVcChannelError] = useState(false);

  const [iaSignal, setIaSignal] = useState("");
  const [ibSignal, setIbSignal] = useState("");
  const [icSignal, setIcSignal] = useState("");
  const [vaSignal, setVaSignal] = useState("");
  const [vbSignal, setVbSignal] = useState("");
  const [vcSignal, setVcSignal] = useState("");
  const [d1Signal, setD1Signal] = useState("");
  const [d2Signal, setD2Signal] = useState("");
  const [d3Signal, setD3Signal] = useState("");
  const [d4Signal, setD4Signal] = useState("");

  const ReadCfgFIle = () => {
    for (let i = 0; i < signal_list.length; i++) signal_list.pop();
    for (let i = 0; i < digital_signal_list.length; i++)
      digital_signal_list.pop();

    if (cfgfile_element.files === null) return;

    let fileName =
      cfgfile_element.files !== null ? cfgfile_element.files[0].name : "";
    let isCFFFile = fileName.slice(-3).toUpperCase() === "CFF" ? true : false;

    // Initialise file reader
    const cfgReader = new FileReader();
    cfgReader.onload = function (e) {
      let cfgFileText = String(e.target?.result);
      let cfgContent =
        cfgFileText !== undefined && cfgFileText !== null
          ? cfgFileText.split("\r\n")
          : "";

      // Skip first line if cff file
      let i = isCFFFile ? 1 : 0;

      // skip LINE 1
      i++;

      // READ LINE 2
      let temArray = cfgContent[i].split(",");
      i++;

      let analogChannelCount = Number(temArray[1].split("A")[0]);
      let digitalChannelCount = Number(temArray[2].split("D")[0]);

      // READ ANALOG CHANNEL INFORMATION
      for (let k = 0; k < analogChannelCount; k++) {
        temArray = cfgContent[i].split(",");
        i++;
        signal_list.push(temArray[1]);
      }

      // READ DIGITAL CHANNEL INFORMATION
      for (let k = 0; k < digitalChannelCount; k++) {
        temArray = cfgContent[i].split(",");
        i++;
        digital_signal_list.push(temArray[1]);
      }
      setCfgSelected(true);
    };
    setCfgSelected(false);
    cfgReader.readAsText(cfgfile_element.files[0]);
  };

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
    setFileAddMessage("");
    cfgfile_element = document.getElementById(
      "cfg_file_button"
    ) as HTMLInputElement;
    ReadCfgFIle();
    setCfgFileName(
      cfgfile_element.files !== null
        ? cfgfile_element.files[0].name
        : "Select CFG File"
    );
  };

  const handleDatFile = () => {
    datfile_element = document.getElementById(
      "dat_file_button"
    ) as HTMLInputElement;
    setDatSelected(true);
    setDatFileName(
      datfile_element.files !== null
        ? datfile_element.files[0].name
        : "Select DAT File"
    );
  };

  const handleNewFileAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cfgfile_element.files !== null && datfile_element.files !== null) {
      setFileAdding(true);
      setFileAddMessage("Uploading .. please wait");
      comtradeFileService
        .createComtradeFile(
          project.project_id,
          cfgfile_element.files[0],
          datfile_element.files[0],
          iaSignal,
          ibSignal,
          icSignal,
          vaSignal,
          vbSignal,
          vcSignal,
          d1Signal,
          d2Signal,
          d3Signal,
          d4Signal
        )
        .then((_res) => {
          setFileAdding(false);
          onAddFiles();
          setFileAddMessage("Station added successfully");
          resetAddFields();
        })
        .catch((err) => {
          setFileAdding(false);
          setFileAddMessage(err.message);
        });
    }
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

  const validateChannels = () => {
    let isValid = true;

    if (iaSignal == "") {
      setIaChannelError(true);
      setIaChannelErrorMsg("Ia channel required");

      isValid = false;
    } else {
      setIaChannelError(false);
      setIaChannelErrorMsg("");
    }

    if (ibSignal == "") {
      setIbChannelError(true);
      setIbChannelErrorMsg("Ib channel required");

      isValid = false;
    } else {
      setIbChannelError(false);
      setIbChannelErrorMsg("");
    }

    if (icSignal == "") {
      setIcChannelError(true);
      setIcChannelErrorMsg("Ic channel required");

      isValid = false;
    } else {
      setIcChannelError(false);
      setIcChannelErrorMsg("");
    }

    if (vaSignal == "") {
      setVaChannelError(true);
      setVaChannelErrorMsg("Va channel required");

      isValid = false;
    } else {
      setVaChannelError(false);
      setVaChannelErrorMsg("");
    }

    if (vbSignal == "") {
      setVbChannelError(true);
      setVbChannelErrorMsg("Vb channel required");

      isValid = false;
    } else {
      setVbChannelError(false);
      setVbChannelErrorMsg("");
    }

    if (vcSignal == "") {
      setVcChannelError(true);
      setVcChannelErrorMsg("Vc channel required");

      isValid = false;
    } else {
      setVcChannelError(false);
      setVcChannelErrorMsg("");
    }

    return isValid;
  };

  const FileAddForm = () => {
    return (
      <form onSubmit={handleNewFileAdd} noValidate>
        <Stack
          display="flex"
          alignItems="center"
          direction="row"
          spacing={2}
          sx={{ ml: 4, mt: 1, mb: 1 }}
        >
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            sx={{
              color: cfgSelected ? "primary" : "black",
              borderColor: cfgSelected ? "primary" : "black",
            }}
            endIcon={<BackupIcon />}
          >
            <Typography
              variant="body2"
              sx={{ color: cfgSelected ? "primary" : "black" }}
            >
              {cfgFileName}
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
            sx={{
              color: datSelected ? "primary" : "black",
              borderColor: datSelected ? "primary" : "black",
            }}
            endIcon={<BackupIcon />}
          >
            <Typography
              variant="body2"
              sx={{ color: datSelected ? "primary" : "black" }}
            >
              {datFileName}
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
            onClick={validateChannels}
          >
            <Typography variant="body2">Add Station</Typography>
          </Button>
          <Typography
            variant="overline"
            sx={{ pl: 2, color: fileAdding ? "error.main" : "success.main" }}
          >
            {fileAddMessage}
          </Typography>
        </Stack>
        {cfgSelected && (
          <>
            <Divider />

            <Stack
              display="flex"
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{ ml: 4, mt: 2, mb: 1 }}
            >
              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={iaChannelError}
                color="error"
              >
                <InputLabel id="ia_signal-label">Ia Channel</InputLabel>
                <Select
                  labelId="ia_signal-label"
                  id="ia_signal"
                  value={iaSignal}
                  label="Ia Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setIaSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "ia" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{iaChannelErrorMsg}</FormHelperText>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={ibChannelError}
                color="warning"
              >
                <InputLabel id="ib_signal-label">Ib Channel</InputLabel>
                <Select
                  labelId="ib_signal-label"
                  id="ib_signal"
                  value={ibSignal}
                  label="Ib Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setIbSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "ib" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{ibChannelErrorMsg}</FormHelperText>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={icChannelError}
              >
                <InputLabel id="ic_signal-label">Ic Channel</InputLabel>
                <Select
                  labelId="ic_signal-label"
                  id="ic_signal"
                  value={icSignal}
                  label="Ic Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setIcSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "ic" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{icChannelErrorMsg}</FormHelperText>
              </FormControl>
            </Stack>

            <Stack
              display="flex"
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{ ml: 4, mt: 2, mb: 1 }}
            >
              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={vaChannelError}
                color="error"
              >
                <InputLabel id="va_signal-label">Va Channel</InputLabel>
                <Select
                  labelId="va_signal-label"
                  id="va_signal"
                  value={vaSignal}
                  label="Va Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setVaSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "va" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{vaChannelErrorMsg}</FormHelperText>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={vbChannelError}
                color="warning"
              >
                <InputLabel id="vb_signal-label">Vb Channel</InputLabel>
                <Select
                  labelId="vb_signal-label"
                  id="vb_signal"
                  value={vbSignal}
                  label="Vb Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setVbSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "vb" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{vbChannelErrorMsg}</FormHelperText>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                required
                focused
                error={vcChannelError}
              >
                <InputLabel id="vc_signal-label">Vc Channel</InputLabel>
                <Select
                  labelId="vc_signal-label"
                  id="vc_signal"
                  value={vcSignal}
                  label="Vc Channel"
                  onChange={(event: SelectChangeEvent) => {
                    setVcSignal(event.target.value as string);
                  }}
                >
                  {signal_list.map((option, index) => (
                    <MenuItem key={option + "vc" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{vcChannelErrorMsg}</FormHelperText>
              </FormControl>
            </Stack>

            <Stack
              display="flex"
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{ ml: 4, mt: 2, mb: 1 }}
            >
              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                focused
                color="success"
              >
                <InputLabel id="d1_signal-label">Digital Channel 1</InputLabel>
                <Select
                  labelId="d1_signal-label"
                  id="d1_signal"
                  value={d1Signal}
                  label="Digital Channel 1"
                  onChange={(event: SelectChangeEvent) => {
                    setD1Signal(event.target.value as string);
                  }}
                >
                  {digital_signal_list.map((option, index) => (
                    <MenuItem key={option + "d1" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                focused
                color="success"
              >
                <InputLabel id="d2_signal-label">Digital Channel 2</InputLabel>
                <Select
                  labelId="d2_signal-label"
                  id="d2_signal"
                  value={d2Signal}
                  label="Digital Channel 2"
                  onChange={(event: SelectChangeEvent) => {
                    setD2Signal(event.target.value as string);
                  }}
                >
                  {digital_signal_list.map((option, index) => (
                    <MenuItem key={option + "d2" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                focused
                color="success"
              >
                <InputLabel id="d3_signal-label">Digital Channel 3</InputLabel>
                <Select
                  labelId="d3_signal-label"
                  id="d3_signal"
                  value={d3Signal}
                  label="Digital Channel 3"
                  onChange={(event: SelectChangeEvent) => {
                    setD3Signal(event.target.value as string);
                  }}
                >
                  {digital_signal_list.map((option, index) => (
                    <MenuItem key={option + "d3" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  width: "150px",
                }}
                focused
                color="success"
              >
                <InputLabel id="d4_signal-label">Digital Channel 4</InputLabel>
                <Select
                  labelId="d4_signal-label"
                  id="d4_signal"
                  value={d4Signal}
                  label="Digital Channel 4"
                  onChange={(event: SelectChangeEvent) => {
                    setD4Signal(event.target.value as string);
                  }}
                >
                  {digital_signal_list.map((option, index) => (
                    <MenuItem key={option + "d4" + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </>
        )}
      </form>
    );
  };

  const resetAddFields = () => {
    setIaSignal("");
    setIbSignal("");
    setIcSignal("");
    setVaSignal("");
    setVbSignal("");
    setVcSignal("");
    setD1Signal("");
    setD2Signal("");
    setD3Signal("");
    setD4Signal("");

    setCfgFileName("Select CFG File");
    setDatFileName("Select DAT File");

    setCfgSelected(false);
    setDatSelected(false);

    for (let i = 0; i < signal_list.length; i++) signal_list.pop();
    for (let i = 0; i < digital_signal_list.length; i++)
      digital_signal_list.pop();
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
              Please select a project to view / edit details
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
          title="Related Stations"
          subheader={
            <Typography sx={{ fontSize: 12 }}>
              Select files and click on Add Station to add stations to this
              project
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
                  {/* <AttachFileSharpIcon /> */}
                  <IconButton
                    aria-label="delete"
                    size="large"
                    onClick={() => handleFileDelete(file.file_id)}
                  >
                    <DeleteForeverIcon fontSize="medium" color="error" />
                  </IconButton>
                  <Typography gutterBottom width="80px" variant="subtitle1">
                    {file.station_name}
                  </Typography>
                  <Typography gutterBottom width="200px" variant="overline">
                    {String(file.start_time_stamp)}
                  </Typography>
                  <Typography gutterBottom variant="overline">
                    Ia: {file.ia_channel}, Ib: {file.ib_channel}, Ic:{" "}
                    {file.ic_channel}, Va: {file.va_channel}, Vb:
                    {file.vb_channel}, Vc: {file.vc_channel}
                  </Typography>
                </Stack>
                <Divider variant="inset" />
              </Box>
            ))
          ) : (
            <Typography variant="overline">No Files uploaded</Typography>
          )}
          {fileAdding && <FileListSkeleton />}
        </CardContent>
        <CardActions
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? "#EEEEEE" : "#323232",
            mb: 0,
          }}
        >
          <FileAddForm />
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

const FileListSkeleton = () => {
  return (
    <Stack
      display="flex"
      alignItems="center"
      direction="row"
      spacing={3}
      sx={{ ml: 4, mt: 1 }}
    >
      <Skeleton variant="circular" width="15px" />
      <Skeleton variant="text" width="80px" />
      <Skeleton variant="text" width="200px" />
      <Skeleton variant="text" width="300px" />
    </Stack>
  );
};

// TODO 2:
// Remove selected from analog signal channel table and digital signal channel table
