import { ChangeEvent, useState } from "react";

// MUI Components
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

//  Icons
import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";
import Dns from "@mui/icons-material/Dns";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomInSharp";
// import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
// import TextsmsIcon from "@mui/icons-material/Textsms";
import SpeakerNotesOutlinedIcon from "@mui/icons-material/SpeakerNotesOutlined";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
//import VisibilityIcon from "@mui/icons-material/Visibility";
//import PageviewIcon from "@mui/icons-material/Pageview";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Tooltip } from "@mui/material";

interface Props {
  stationName: string;
  plotSubtitle: string;
  timeValues_original: number[];
  presentZoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  };

  onZoomResetClick: () => void;
  onZoomInClick: (fromValue: number, toValue: number) => void;
  markerStatus: boolean;
  onMarkerStatusChange: (markerStatus: boolean) => void;
  onYZoomClick: (zoomType: number) => void;
  timeRange: {
    minTime: number;
    maxTime: number;
  };
  tooltipStatus: boolean;
}

const TOOLTIP_DELAY = 10000;

const ChartHeader = ({
  stationName,
  plotSubtitle,
  timeValues_original,
  presentZoomValues,
  onZoomResetClick,
  onZoomInClick,
  markerStatus,
  onMarkerStatusChange,
  onYZoomClick,
  timeRange,
  tooltipStatus,
}: Props) => {
  // STATE VARIABLES
  const [open, setOpen] = useState(false);
  const [errMessage, setErrorMessage] = useState("");

  // OTHER VARIABLE
  let isMarker = markerStatus;
  let startTime = presentZoomValues.startTime;
  let endTime = presentZoomValues.endTime;

  // EVENT HANDLER FUNCTIONS
  const handleZoomViewClick = () => {
    if (timeValues_original === undefined) return;

    const fValue = document.getElementById("fromValue") as HTMLInputElement;
    const tValue = document.getElementById("toValue") as HTMLInputElement;
    const fromValue = parseFloat(fValue.value);
    const toValue = parseFloat(tValue.value);

    let fromValue_Index = timeValues_original.findIndex(
      (element) => element >= fromValue
    );
    fromValue_Index = fromValue_Index === -1 ? 0 : fromValue_Index;

    let toValue_Index = timeValues_original.findIndex(
      (element) => element >= toValue
    );
    toValue_Index = toValue_Index === -1 ? 0 : toValue_Index;

    let toValue_min_allowed =
      fromValue_Index + 16 > timeValues_original.length - 1
        ? timeValues_original[timeValues_original.length - 1]
        : timeValues_original[fromValue_Index + 16];

    let fromValue_min_allowed =
      toValue_Index - 16 < 0
        ? timeValues_original[0]
        : timeValues_original[toValue_Index - 16];

    if (fromValue < timeRange.minTime) {
      setErrorMessage("'from value' is lower than minimum available time");
      setOpen(true);
    } else if (toValue > timeRange.maxTime) {
      setErrorMessage("'to value' is higher than maximum available time");
      setOpen(true);
    } else if (fromValue >= toValue) {
      setErrorMessage("'from value' cannot be >= than 'to value'");
      setOpen(true);
    } else if (toValue < toValue_min_allowed) {
      setErrorMessage(`'to value' cannot be lower than ${toValue_min_allowed}`);
      setOpen(true);
    } else if (fromValue > fromValue_min_allowed) {
      setErrorMessage(
        `'from value' cannot be higher than ${fromValue_min_allowed}`
      );
      setOpen(true);
    } else {
      onZoomInClick(fromValue, toValue);
    }
  };

  const handleZoomInClick = () => {
    const ZOOM_STEP = 2;

    if (startTime === 0 && endTime === 0) return;

    let changed = false;

    let total_time_range = timeRange.maxTime - timeRange.minTime;
    let present_start_percentage =
      ((startTime - timeRange.minTime) / total_time_range) * 100;
    let present_end_percentage =
      ((endTime - timeRange.minTime) / total_time_range) * 100;

    if (present_start_percentage < 100 - ZOOM_STEP) {
      present_start_percentage = present_start_percentage + ZOOM_STEP;
      changed = true;
    }
    if (present_end_percentage > ZOOM_STEP) {
      present_end_percentage = present_end_percentage - ZOOM_STEP;
      changed = true;
    }

    if (present_end_percentage <= present_start_percentage) changed = false;

    if (changed) {
      let new_start_time =
        (present_start_percentage / 100) * total_time_range + timeRange.minTime;
      let new_end_time =
        (present_end_percentage / 100) * total_time_range + timeRange.minTime;

      // setStartTime(new_start_time);
      // setEndTime(new_end_time);
      startTime = new_start_time;
      endTime = new_end_time;

      onZoomInClick(new_start_time, new_end_time);
    }
  };

  const handleZoomOutClick = () => {
    const ZOOM_STEP = 2;

    if (startTime === 0 && endTime === 0) return;

    let changed = false;

    let total_time_range = timeRange.maxTime - timeRange.minTime;
    let present_start_percentage =
      ((startTime - timeRange.minTime) / total_time_range) * 100;
    let present_end_percentage =
      ((endTime - timeRange.minTime) / total_time_range) * 100;

    if (present_start_percentage > ZOOM_STEP) {
      present_start_percentage = present_start_percentage - ZOOM_STEP;
      changed = true;
    }
    if (present_end_percentage < 100 - ZOOM_STEP) {
      present_end_percentage = present_end_percentage + ZOOM_STEP;
      changed = true;
    }

    if (present_end_percentage <= present_start_percentage) changed = false;

    if (changed) {
      let new_start_time =
        (present_start_percentage / 100) * total_time_range + timeRange.minTime;
      let new_end_time =
        (present_end_percentage / 100) * total_time_range + timeRange.minTime;

      // setStartTime(new_start_time);
      // setEndTime(new_end_time);
      startTime = new_start_time;
      endTime = new_end_time;
      onZoomInClick(new_start_time, new_end_time);
    }
  };

  const handleZoomResetClick = () => {
    startTime = timeRange.minTime;
    endTime = timeRange.minTime;
    // setStartTime(timeRange.minTime);
    // setEndTime(timeRange.minTime);
    onZoomResetClick();
  };

  const handleYZoomInClick = () => {
    handleYZoom(1);
  };

  const handleYZoomOutClick = () => {
    handleYZoom(2);
  };

  const handleYReset = () => {
    handleYZoom(3);
  };

  const handleYPanUpClick = () => {
    handleYZoom(4);
  };

  const handleYPanDownClick = () => {
    handleYZoom(5);
  };

  const handleYZoom = (code: number) => {
    onYZoomClick(code);
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorMessage("");
    setOpen(false);
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  // if (
  //   presentZoomValues.startTime !== startTime ||
  //   presentZoomValues.endTime !== endTime
  // ) {
  //   setStartTime(presentZoomValues.startTime);
  //   setEndTime(presentZoomValues.endTime);
  // }

  return (
    <>
      <Card sx={{ m: 0, height: "85px" }}>
        <CardContent sx={{ p: 0, bgcolor: "" }}>
          <Grid
            container
            display="flex"
            justifyContent="flex-start"
            width="100%"
            sx={{ bgcolor: "" }}
          >
            <Grid item xs={0.7} sx={{ ml: 1.5, mt: 1.5 }}>
              <Avatar sx={{ bgcolor: "cadetblue" }}>
                {plotSubtitle === "Single Axis View" ? (
                  <AutoAwesomeMotionSharpIcon />
                ) : (
                  <Dns />
                )}
              </Avatar>
            </Grid>
            <Grid item xs={1.8} sx={{ ml: 0, mt: 1.5, bgcolor: "" }}>
              <Stack>
                <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
                  {stationName}
                </Typography>
                <Typography variant="overline" sx={{ fontSize: "0.7rem" }}>
                  {plotSubtitle}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={9.2} sx={{ mt: 0.5, bgcolor: "" }}>
              <Grid
                container
                direction="row"
                display="flex"
                justifyContent="space-between"
                sx={{ padding: 0.5 }}
              >
                <Grid item xs={6.8}>
                  <Stack direction="column">
                    <Typography variant="caption" color="primary">
                      Time-Axis controls
                    </Typography>
                    <Grid
                      container
                      display="flex"
                      justifyContent="space-between"
                      sx={{ border: 0.2, pl: 1, height: "55px" }}
                    >
                      <Grid item xs={3} sx={{ pr: 1 }}>
                        <FormControl id="fromValue_form" variant="standard">
                          <ZoomTextInput
                            id="fromValue"
                            type="number"
                            value={startTime}
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) => {
                              if (!isNaN(parseFloat(event.target.value)))
                                handleZoomViewClick();
                            }}
                            aria-describedby="x-from-text"
                            inputProps={{
                              "aria-label": "from-x",
                            }}
                          />
                          <Tooltip
                            title="Zoom start time"
                            placement="bottom"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <FormHelperText id="x-from-text">
                              from
                            </FormHelperText>
                          </Tooltip>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3} sx={{ pr: 1 }}>
                        <FormControl id="toValue_form" variant="standard">
                          <ZoomTextInput
                            id="toValue"
                            type="number"
                            value={endTime}
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) => {
                              if (!isNaN(parseFloat(event.target.value)))
                                handleZoomViewClick();
                              //  endTime = parseFloat(event.target.value);
                              // setEndTime(parseFloat(event.target.value));
                            }}
                            aria-describedby="x-to-text"
                            inputProps={{
                              "aria-label": "to-x",
                            }}
                          />
                          <Tooltip
                            title="Zoom end time"
                            placement="bottom"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <FormHelperText id="x-to-text">to</FormHelperText>
                          </Tooltip>
                        </FormControl>
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          color="primary"
                          aria-label="Zoom-in"
                          onClick={handleZoomInClick}
                          //  sx={{ width: "30px" }}
                        >
                          <Tooltip
                            title="Zoom IN"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ZoomInIcon fontSize="medium" />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          color="primary"
                          aria-label="Zoom-out"
                          onClick={handleZoomOutClick}
                          //       sx={{ width: "30px" }}
                        >
                          <Tooltip
                            title="Zoom OUT"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ZoomOutIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          color="primary"
                          aria-label="Reset-time-axis"
                          onClick={handleZoomResetClick}
                          //       sx={{ width: "30px" }}
                        >
                          <Tooltip
                            title="Reset time axis"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <RestoreIcon fontSize="small" />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={3.8}>
                  <Stack direction="column">
                    <Typography variant="caption" color="secondary">
                      Y-Axis controls
                    </Typography>
                    <Grid
                      container
                      display="flex"
                      justifyContent="space-between"
                      sx={{ border: 0.2, pl: 0.5, pr: 0.5, height: "55px" }}
                    >
                      <Grid item xs={2.5}>
                        <IconButton
                          color="secondary"
                          aria-label="View"
                          onClick={handleYZoomInClick}
                        >
                          <Tooltip
                            title="Zoom IN"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ZoomInIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={2.5}>
                        <IconButton
                          color="secondary"
                          aria-label="View"
                          onClick={handleYZoomOutClick}
                        >
                          <Tooltip
                            title="Zoom OUT"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ZoomOutIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={2.0}>
                        <IconButton
                          color="secondary"
                          aria-label="Pan Up"
                          onClick={handleYPanUpClick}
                          disabled={
                            plotSubtitle === "Multiple Axis View" ? true : false
                          }
                        >
                          <Tooltip
                            title="Pan UP"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ExpandLessIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={2.0}>
                        <IconButton
                          color="secondary"
                          aria-label="Pan Down"
                          onClick={handleYPanDownClick}
                          disabled={
                            plotSubtitle === "Multiple Axis View" ? true : false
                          }
                        >
                          <Tooltip
                            title="Pan DOWN"
                            placement="bottom"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <ExpandMoreIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                      <Grid item xs={3.0}>
                        <IconButton
                          color="secondary"
                          aria-label="View"
                          onClick={handleYReset}
                        >
                          <Tooltip
                            title="Reset magnitude axis"
                            placement="top"
                            enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                          >
                            <RestoreIcon />
                          </Tooltip>
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={1}>
                  <Stack direction="column">
                    <Tooltip
                      title="View instantaneous values on chart"
                      placement="top"
                      enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                    >
                      <Typography variant="caption" color="success">
                        Markers
                      </Typography>
                    </Tooltip>
                    <FormControl
                      variant="standard"
                      sx={{
                        height: "55px",
                        //width: "55px",
                        border: 0.2,
                      }}
                    >
                      <Checkbox
                        checked={isMarker}
                        aria-describedby="x-check-text"
                        icon={<SpeakerNotesOutlinedIcon color="success" />}
                        checkedIcon={<SpeakerNotesIcon color="success" />}
                        onChange={(event) => {
                          isMarker = event.target.checked;
                          onMarkerStatusChange(event.target.checked);
                        }}
                        size="large"
                        sx={{ bgcolor: "", padding: 0, mt: 0.8 }}
                      />
                      {/* <FormHelperText id="x-check-text">
                      {"  "}
                      {`markers`}
                    </FormHelperText> */}
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleClose}
        message={errMessage}
        action={action}
      />
    </>
  );
};

export default ChartHeader;

const ZoomTextInput = styled(Input)(({ theme }) => ({
  color: theme.palette.mode === "light" ? "#444444" : "#999999",
  fontSize: "0.8rem",
  paddingTop: "3px",
}));
