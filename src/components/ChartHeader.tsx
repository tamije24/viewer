import { ChangeEvent, useState } from "react";

// MUI Components
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

//  Icons
import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomInSharp";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import TextsmsIcon from "@mui/icons-material/Textsms";

interface Props {
  stationName: string;
  plotSubtitle: string;
  presentZoomValues: {
    startTime: number;
    endTime: number;
  };
  onZoomOutClick: () => void;
  onZoomInClick: (fromValue: number, toValue: number) => void;
  onToolTipStatusChange: (toolTipStatus: boolean) => void;
}

const ChartHeader = ({
  stationName,
  plotSubtitle,
  presentZoomValues,
  onZoomOutClick,
  onZoomInClick,
  onToolTipStatusChange,
}: Props) => {
  // STATE VARIABLES
  const [isTooltip, setIsTooltip] = useState(false);
  const [prevZoomValues, setPrevZoomValues] = useState([0, 0]);
  const [startTime, setStartTime] = useState(presentZoomValues.startTime);
  const [endTime, setEndTime] = useState(presentZoomValues.endTime);

  // EVENT HANDLER FUNCTIONS
  // TODO: incorrect values entered must be rejected at source
  const handleZoomInClick = () => {
    const fValue = document.getElementById("fromValue") as HTMLInputElement;
    const tValue = document.getElementById("toValue") as HTMLInputElement;
    const fromValue = parseFloat(fValue.value);
    const toValue = parseFloat(tValue.value);

    if (fromValue >= toValue) return;

    onZoomInClick(fromValue, toValue);
    setPrevZoomValues([fromValue, toValue]);
  };

  // STORE NEW ZOOM VALUE TO ENABLE ZOOM STATE CHANGE DETECTION
  if (
    prevZoomValues[0] !== presentZoomValues.startTime ||
    prevZoomValues[1] !== presentZoomValues.endTime
  ) {
    setPrevZoomValues([presentZoomValues.startTime, presentZoomValues.endTime]);
    setStartTime(presentZoomValues.startTime);
    setEndTime(presentZoomValues.endTime);
  }

  return (
    <Card sx={{ m: 0, height: "75px" }}>
      <CardContent sx={{ p: 0, bgcolor: "" }}>
        <Grid
          container
          display="flex"
          justifyContent="flex-start"
          width="100%"
          sx={{ bgcolor: "" }}
        >
          <Grid
            item
            xs={1}
            sx={{
              ml: 1.5,
              mt: 1.5,
              bgcolor: "",
            }}
          >
            <Avatar sx={{ bgcolor: "cadetblue" }}>
              <AutoAwesomeMotionSharpIcon />
            </Avatar>
          </Grid>
          <Grid item xs={2} sx={{ ml: 0, mt: 1.5, bgcolor: "" }}>
            <Stack>
              <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
                {stationName}
              </Typography>
              <Typography variant="overline" sx={{ fontSize: "0.7rem" }}>
                {plotSubtitle}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={8.5} sx={{ mt: 0.5, bgcolor: "" }}>
            <Grid
              container
              direction="row"
              display="flex"
              justifyContent="space-between"
              sx={{ padding: 0.5 }}
            >
              <Grid
                item
                xs={6.9}
                sx={{ bgcolor: "", border: 0.2, paddingLeft: 1 }}
              >
                <Stack direction="row" spacing={2}>
                  <FormControl variant="standard" sx={{ width: "55px" }}>
                    <Input
                      id="fromValue"
                      type="number"
                      value={startTime}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setStartTime(parseFloat(event.target.value));
                      }}
                      aria-describedby="x-from-text"
                      inputProps={{
                        "aria-label": "from-x",
                      }}
                    />
                    <FormHelperText id="x-from-text">from</FormHelperText>
                  </FormControl>
                  <FormControl
                    variant="standard"
                    sx={{ height: "30px", width: "55px" }}
                  >
                    <Input
                      id="toValue"
                      type="number"
                      value={endTime}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setEndTime(parseFloat(event.target.value));
                      }}
                      aria-describedby="x-to-text"
                      inputProps={{
                        "aria-label": "to-x",
                      }}
                    />
                    <FormHelperText id="x-to-text">to</FormHelperText>
                  </FormControl>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleZoomInClick}
                    sx={{ fontSize: "1 rem", pt: 0.5 }}
                    startIcon={<ZoomInIcon fontSize="small" />}
                  >
                    Zoom
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={onZoomOutClick}
                    sx={{ fontSize: "1 rem", pt: 0.5 }}
                    startIcon={<ZoomOutIcon fontSize="small" />}
                  >
                    Reset
                  </Button>
                  <FormControl
                    variant="standard"
                    sx={{ height: "30px", width: "55px" }}
                  >
                    <Checkbox
                      checked={isTooltip}
                      aria-describedby="x-check-text"
                      icon={<TextsmsOutlinedIcon color="primary" />}
                      checkedIcon={<TextsmsIcon />}
                      onChange={(event) => {
                        setIsTooltip(event.target.checked);
                        onToolTipStatusChange(event.target.checked);
                      }}
                      size="small"
                      sx={{ bgcolor: "", padding: 0, mt: 0.8 }}
                    />
                    <FormHelperText id="x-check-text">
                      {"  "}
                      {`markers`}
                    </FormHelperText>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={4.9} sx={{ border: 0.2 }}>
                <Typography></Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ChartHeader;
