import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachmentIcon from "@mui/icons-material/Attachment";
//import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";
import BackupIcon from "@mui/icons-material/Backup";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import PlaceSharpIcon from "@mui/icons-material/PlaceSharp";
import CloseIcon from "@mui/icons-material/Close";

import projectService, { Project } from "../services/project-service";
import Grid from "@mui/material/Grid";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  styled,
} from "@mui/material";

import {
  DataGridPro,
  GridRowParams,
  GridCallbackDetails,
  MuiEvent,
  GridActionsCellItem,
} from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid/models/colDef";

import comtradeFileService, {
  ComtradeFile,
} from "../services/comtrade-file-service";

let cfgfile_element: HTMLInputElement;
let datfile_element: HTMLInputElement;

let signal_list: string[] = [];
let digital_signal_list: { id: number; title: string }[] = [];

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
  const [addStationVisible, setAddStationVisible] = useState(false);

  const [cfgSelected, setCfgSelected] = useState(false);
  const [datSelected, setDatSelected] = useState(false);

  const [cfgFileName, setCfgFileName] = useState("Select CFG File");
  const [datFileName, setDatFileName] = useState("Select DAT File");
  const [fileAdding, setFileAdding] = useState(false);
  const [fileAddMessage, setFileAddMessage] = useState(
    "Select COMTRADE files to upload"
  );

  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedStation, setSelectedStation] = useState("");
  const [open, setOpen] = useState(false);

  const [iaChannelErrorMsg, setIaChannelErrorMsg] = useState("");
  const [ibChannelErrorMsg, setIbChannelErrorMsg] = useState("");
  const [icChannelErrorMsg, setIcChannelErrorMsg] = useState("");
  const [inChannelErrorMsg, setInChannelErrorMsg] = useState("");
  const [vaChannelErrorMsg, setVaChannelErrorMsg] = useState("");
  const [vbChannelErrorMsg, setVbChannelErrorMsg] = useState("");
  const [vcChannelErrorMsg, setVcChannelErrorMsg] = useState("");

  const [iaChannelError, setIaChannelError] = useState(false);
  const [ibChannelError, setIbChannelError] = useState(false);
  const [icChannelError, setIcChannelError] = useState(false);
  const [inChannelError, setInChannelError] = useState(false);
  const [vaChannelError, setVaChannelError] = useState(false);
  const [vbChannelError, setVbChannelError] = useState(false);
  const [vcChannelError, setVcChannelError] = useState(false);

  const [iaSignal, setIaSignal] = useState<string | null>(null);
  const [ibSignal, setIbSignal] = useState<string | null>(null);
  const [icSignal, setIcSignal] = useState<string | null>(null);
  const [inSignal, setInSignal] = useState<string | null>(null);
  const [vaSignal, setVaSignal] = useState<string | null>(null);
  const [vbSignal, setVbSignal] = useState<string | null>(null);
  const [vcSignal, setVcSignal] = useState<string | null>(null);
  const [d1Signal, setD1Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d2Signal, setD2Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d3Signal, setD3Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d4Signal, setD4Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d5Signal, setD5Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d6Signal, setD6Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d7Signal, setD7Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d8Signal, setD8Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d9Signal, setD9Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d10Signal, setD10Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d11Signal, setD11Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [d12Signal, setD12Signal] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const ReadCfgFIle = () => {
    if (cfgfile_element.files === null) return;

    let fileName =
      cfgfile_element.files !== null ? cfgfile_element.files[0].name : "";
    let isCFFFile = fileName.slice(-3).toUpperCase() === "CFF" ? true : false;

    // Initialise file reader
    const cfgReader = new FileReader();
    cfgReader.onload = function (e) {
      signal_list = [];
      digital_signal_list = [];

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
        digital_signal_list.push({ id: k, title: temArray[1] });
      }
      setCfgSelected(true);
      setFileAddMessage("Select channels before adding station to list");
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
    resetAddFields();
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
      if (validateChannels()) {
        setFileAdding(true);
        setFileAddMessage("Uploading .. please wait");
        comtradeFileService
          .createComtradeFile(
            project.project_id,
            cfgfile_element.files[0],
            datfile_element.files[0],
            iaSignal == null ? "" : iaSignal,
            ibSignal == null ? "" : ibSignal,
            icSignal == null ? "" : icSignal,
            inSignal == null ? "" : inSignal,
            vaSignal == null ? "" : vaSignal,
            vbSignal == null ? "" : vbSignal,
            vcSignal == null ? "" : vcSignal,
            d1Signal == null ? "" : d1Signal.title,
            d2Signal == null ? "" : d2Signal.title,
            d3Signal == null ? "" : d3Signal.title,
            d4Signal == null ? "" : d4Signal.title,
            d5Signal == null ? "" : d5Signal.title,
            d6Signal == null ? "" : d6Signal.title,
            d7Signal == null ? "" : d7Signal.title,
            d8Signal == null ? "" : d8Signal.title,
            d9Signal == null ? "" : d9Signal.title,
            d10Signal == null ? "" : d10Signal.title,
            d11Signal == null ? "" : d11Signal.title,
            d12Signal == null ? "" : d12Signal.title
          )
          .then((_res) => {
            setFileAdding(false);
            onAddFiles();
            setFileAddMessage("Station added successfully");
            resetAddFields();
            setAddStationVisible(false);
          })
          .catch((err) => {
            setFileAdding(false);
            setFileAddMessage(err.message);
            resetAddFields();
            // setAddStationVisible(false);
          });
      }
    }
  };

  const onRowSelect = (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    setSelectedRow(params.row.id);
    setSelectedStation(params.row.station);
  };

  const handleFileDelete = (file_id: number) => {
    comtradeFileService
      .deleteComtradeFile(project.project_id, file_id)
      .then((_res) => {
        onAddFiles();
        setSelectedRow(-1);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedRow(-1);
  };

  const handleOk = () => {
    handleFileDelete(selectedRow);
    setOpen(false);
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

    if (!iaSignal) {
      setIaChannelError(true);
      setIaChannelErrorMsg("Ia channel required");

      isValid = false;
    } else {
      setIaChannelError(false);
      setIaChannelErrorMsg("");
    }

    if (!ibSignal) {
      setIbChannelError(true);
      setIbChannelErrorMsg("Ib channel required");

      isValid = false;
    } else {
      setIbChannelError(false);
      setIbChannelErrorMsg("");
    }

    if (!icSignal) {
      setIcChannelError(true);
      setIcChannelErrorMsg("Ic channel required");

      isValid = false;
    } else {
      setIcChannelError(false);
      setIcChannelErrorMsg("");
    }

    if (!inSignal) {
      setInChannelError(true);
      setInChannelErrorMsg("In channel required");

      isValid = false;
    } else {
      setInChannelError(false);
      setInChannelErrorMsg("");
    }

    if (!vaSignal) {
      setVaChannelError(true);
      setVaChannelErrorMsg("Va channel required");

      isValid = false;
    } else {
      setVaChannelError(false);
      setVaChannelErrorMsg("");
    }

    if (!vbSignal) {
      setVbChannelError(true);
      setVbChannelErrorMsg("Vb channel required");

      isValid = false;
    } else {
      setVbChannelError(false);
      setVbChannelErrorMsg("");
    }

    if (!vcSignal) {
      setVcChannelError(true);
      setVcChannelErrorMsg("Vc channel required");

      isValid = false;
    } else {
      setVcChannelError(false);
      setVcChannelErrorMsg("");
    }

    // TODO: CHECK ORDER OF DIGITAL CHANNELS - higher channels cannot be selected without filling lower channels

    return isValid;
  };

  const FileAddForm = () => {
    const defaultProps = {
      fullWidth: true,
      handleHomeEndKeys: true,
      noOptionsText: "No channels",
      clearOnEscape: true,
      disableClearable: true,
    };

    const analogChannelProps = {
      options: signal_list,
      getOptionLabel: (option: string) => option,
    };

    const digitalChannelProps = {
      options: digital_signal_list,
      getOptionKey: (option: { id: number; title: string }) => option.id,
      getOptionLabel: (option: { id: number; title: string }) => option.title,
    };

    return (
      <form onSubmit={handleNewFileAdd} noValidate>
        <Card
          sx={{
            mt: 0,
            ml: 0,
            mb: 0,
            pt: 0,
          }}
        >
          <CardHeader
            sx={{
              m: 0,
              pt: 1,
              pl: 2,
              pb: 1,
              borderBottom: 0.5,
              // bgcolor: "red",
            }}
            avatar={
              <Avatar sx={{ m: 1, bgcolor: "orchid" }}>
                <AddLocationIcon />
              </Avatar>
            }
            title="Add New Station"
            subheader={
              <Typography
                sx={{
                  fontSize: fileAdding ? 16 : 13,
                  color: fileAdding ? "error.main" : "success.main",
                }}
              >
                {fileAddMessage}
              </Typography>
            }
            action={
              <Stack
                display="flex"
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{ ml: 4, mt: 1, mb: 0 }}
              >
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  disabled={!cfgSelected || !datSelected}
                  endIcon={<FileUploadIcon />}
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  <Typography variant="caption">Upload</Typography>
                </Button>
                <Button
                  type="reset"
                  size="small"
                  variant="contained"
                  endIcon={<CloseIcon />}
                  color="warning"
                  sx={{ ml: 0 }}
                  onClick={() => {
                    resetAddFields();
                    setAddStationVisible(false);
                  }}
                >
                  <Typography variant="caption">Cancel</Typography>
                </Button>
              </Stack>
            }
          />
          <CardContent sx={{ bgcolor: "", pl: 4 }}>
            <Grid2 container spacing={1} sx={{ pb: 2 }}>
              <Grid2 xs={6}>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  sx={{
                    width: "100%",
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
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  sx={{
                    width: "100%",
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
              </Grid2>
            </Grid2>
            {cfgSelected && (
              <>
                <Grid2 container rowSpacing={3} columnSpacing={1}>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      // focused
                      error={iaChannelError}
                      //  color="error"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="ia_signal"
                        value={iaSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setIaSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Ia Channel"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        )}
                      />
                      <FormHelperText>{iaChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={ibChannelError}
                      color="warning"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="ib_signal"
                        value={ibSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setIbSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Ib Channel"
                          />
                        )}
                      />
                      <FormHelperText>{ibChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={icChannelError}
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="ic_signal"
                        value={icSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setIcSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Ic Channel"
                          />
                        )}
                      />
                      <FormHelperText>{icChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={inChannelError}
                      color="success"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="in_signal"
                        value={inSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setInSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="In Channel"
                          />
                        )}
                      />
                      <FormHelperText>{inChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                </Grid2>
                <Grid2 container rowSpacing={3} columnSpacing={1}>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={vaChannelError}
                      color="error"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="va_signal"
                        value={vaSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setVaSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Va Channel"
                          />
                        )}
                      />
                      <FormHelperText>{vaChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={vbChannelError}
                      color="warning"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="vb_signal"
                        value={vbSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setVbSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Vb Channel"
                          />
                        )}
                      />
                      <FormHelperText>{vbChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      required
                      focused
                      error={vcChannelError}
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...analogChannelProps}
                        id="vc_signal"
                        value={vcSignal}
                        onChange={(_event: any, newValue: string | null) => {
                          setVcSignal(newValue == null ? "" : newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Vc Channel"
                          />
                        )}
                      />
                      <FormHelperText>{vcChannelErrorMsg}</FormHelperText>
                    </FormControl>
                  </Grid2>
                </Grid2>
                <Grid2 container rowSpacing={3} columnSpacing={1}>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d1_signal"
                        value={d1Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD1Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 1"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d2_signal"
                        value={d2Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD2Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 2"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d3_signal"
                        value={d3Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD3Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 3"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d4_signal"
                        value={d4Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD4Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 4"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                </Grid2>
                <Grid2 container rowSpacing={3} columnSpacing={1}>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d5_signal"
                        value={d5Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD5Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 5"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d6_signal"
                        value={d6Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD6Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 6"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d7_signal"
                        value={d7Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD7Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 7"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d8_signal"
                        value={d8Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD8Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 8"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                </Grid2>
                <Grid2 container rowSpacing={3} columnSpacing={1}>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d9_signal"
                        value={d9Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD9Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 9"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d10_signal"
                        value={d10Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD10Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 10"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d11_signal"
                        value={d11Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD11Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 11"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 xs={3}>
                    <FormControl
                      size="small"
                      sx={{
                        width: "100%",
                      }}
                      focused
                      color="secondary"
                    >
                      <Autocomplete
                        {...defaultProps}
                        {...digitalChannelProps}
                        id="d12_signal"
                        value={d12Signal}
                        onChange={(
                          _event: any,
                          newValue: { id: number; title: string } | null
                        ) => {
                          setD12Signal(
                            newValue == null ? { id: 0, title: "" } : newValue
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Digital Channel 12"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid2>
                </Grid2>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    );
  };

  const ListStationDetails = () => {
    let file: ComtradeFile;
    let tempTable: {
      id: number;
      station: string;
      start_time: string;
      trigger_time: string;
      ia: string;
      ib: string;
      ic: string;
      in: string;
      va: string;
      vb: string;
      vc: string;
    }[] = [];

    for (let i = 0; i < project.files.length; i++) {
      file = project.files[i];
      tempTable.push({
        id: file.file_id,
        station: file.station_name,
        start_time: String(file.start_time_stamp),
        trigger_time: String(file.trigger_time_stamp),
        ia: file.ia_channel,
        ib: file.ib_channel,
        ic: file.ic_channel,
        in: file.in_channel,
        va: file.va_channel,
        vb: file.vb_channel,
        vc: file.vc_channel,
      });
    }
    const rows = tempTable;

    const columns: GridColDef<(typeof rows)[number]>[] = [
      {
        field: "actions",
        type: "actions",
        width: 20,
        getActions: ({ id, row }) => {
          return [
            <GridActionsCellItem
              icon={<DeleteForeverIcon color="error" />}
              label="Delete station"
              onClick={() => {
                setSelectedRow(Number(id));
                setSelectedStation(row.station);
                setOpen(true);
              }}
            />,
          ];
        },
      },
      {
        field: "station",
        headerName: "STATION",
        description: "Station Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        minWidth: 100,
        width: 100,
      },
      {
        field: "start_time",
        // type: "dateTime",
        // valueGetter: (value) => value && new Date(value),
        headerName: "Start Time",
        description: "Record Start Time",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "center",
        align: "left",
        //   minWidth: 70,
        width: 180,
      },
      {
        field: "trigger_time",
        // type: "dateTime",
        // valueGetter: (value) => value && new Date(value),
        headerName: "Trigger Time",
        description: "Record Trigger Time",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "center",
        align: "left",
        //   minWidth: 70,
        width: 180,
      },
      {
        field: "ia",
        headerName: "IA-Channel",
        description: "Ia - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "ib",
        headerName: "IB-Channel",
        description: "Ib - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "ic",
        headerName: "IC-Channel",
        description: "Ic - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "in",
        headerName: "IN-Channel",
        description: "In - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "va",
        headerName: "VA-Channel",
        description: "Va - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "vb",
        headerName: "VB-Channel",
        description: "Vb - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
      {
        field: "vc",
        headerName: "VC-Channel",
        description: "Vc - Channel Name",
        sortable: false,
        headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
        headerAlign: "left",
        align: "left",
        width: 120,
      },
    ];

    return (
      <>
        <CardContent>
          {project.files.length > 0 ? (
            <DataGridPro
              rows={rows}
              columns={columns}
              hideFooterRowCount
              checkboxSelection={false}
              //disableRowSelectionOnClick
              showCellVerticalBorder={true}
              showColumnVerticalBorder={true}
              disableColumnMenu={true}
              rowHeight={60}
              density={"compact"}
              // slots={{ toolbar: CustomToolbar }}
              sx={{
                width: "100%",
                height: "100%",
                fontSize: "0.7rem",
              }}
              hideFooter={true}
              onRowClick={onRowSelect}
            />
          ) : (
            <Typography sx={{ fontSize: 13 }}>No Stations Added</Typography>
          )}
        </CardContent>
        <Dialog
          //  fullScreen={fullScreen}
          open={open}
          keepMounted
        >
          <DialogTitle id="responsive-dialog-title">
            {"Delete Confirmation"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the {selectedStation} station ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleOk} autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const resetAddFields = () => {
    setIaSignal(null);
    setIbSignal(null);
    setIcSignal(null);
    setInSignal(null);
    setVaSignal(null);
    setVbSignal(null);
    setVcSignal(null);
    setD1Signal(null);
    setD2Signal(null);
    setD3Signal(null);
    setD4Signal(null);
    setD5Signal(null);
    setD6Signal(null);
    setD7Signal(null);
    setD8Signal(null);
    setD9Signal(null);
    setD10Signal(null);
    setD11Signal(null);
    setD12Signal(null);

    setIaChannelErrorMsg("");
    setIbChannelErrorMsg("");
    setIcChannelErrorMsg("");
    setInChannelErrorMsg("");
    setVaChannelErrorMsg("");
    setVbChannelErrorMsg("");
    setVcChannelErrorMsg("");

    setIaChannelError(false);
    setIbChannelError(false);
    setIcChannelError(false);
    setInChannelError(false);
    setVaChannelError(false);
    setVbChannelError(false);
    setVcChannelError(false);

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
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<AddLocationIcon />}
              sx={{ ml: 0 }}
              onClick={() => {
                setAddStationVisible(true);
                setSelectedRow(-1);
              }}
              color="success"
            >
              Add Station
            </Button>
          }
        />
        {!addStationVisible && <ListStationDetails />}
        {addStationVisible && <FileAddForm />}
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
