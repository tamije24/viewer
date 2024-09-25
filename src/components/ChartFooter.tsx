import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
//import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
//import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";

interface Props {
  timeRange: {
    minTime: number;
    maxTime: number;
  };
  presentZoomValues: {
    startPercent: number;
    endPercent: number;
  };
  onZoomChange: (fromValue: number, toValue: number) => void;
}

const PAN_FACTOR = 0.5;

const ChartFooter = ({ timeRange, presentZoomValues, onZoomChange }: Props) => {
  let value = [presentZoomValues.startPercent, presentZoomValues.endPercent];
  let minDistance = 10;

  const handleChange = (
    _event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        value = [clamped, clamped + minDistance];
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        value = [clamped - minDistance, clamped];
      }
    } else {
      value = newValue as number[];
    }
    onZoomChange(newValue[0], newValue[1]);
  };

  const handlePanLeft = () => {
    let startValue = value[0];
    let endValue = value[1];

    let PAN_SPAN = (endValue - startValue) * PAN_FACTOR;

    if (startValue < PAN_SPAN) {
      endValue = endValue - startValue;
      startValue = 0;
    } else {
      startValue = startValue - PAN_SPAN;
      endValue = endValue - PAN_SPAN;
    }

    onZoomChange(startValue, endValue);
  };

  const handlePanRight = () => {
    let startValue = value[0];
    let endValue = value[1];

    let PAN_SPAN = (endValue - startValue) * PAN_FACTOR;

    if (endValue > 100 - PAN_SPAN) {
      startValue = startValue - (100 - endValue);
      endValue = 100;
    } else {
      startValue = startValue + PAN_SPAN;
      endValue = endValue + PAN_SPAN;
    }

    onZoomChange(startValue, endValue);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 0,
        mb: 0.5,
        mr: 0,
        ml: 0,
      }}
    >
      <CardContent
        sx={{
          bgcolor: "secondary",
          height: "70px",
          paddingTop: 0,
          paddingLeft: 0,
        }}
      >
        <Grid
          container
          width="100%"
          sx={{
            bgcolor: "",
            mt: 0.5,
            p: 0,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Grid item width="3%" sx={{ bgcolor: "" }}>
            <IconButton
              color="secondary"
              aria-label="pan-left"
              onClick={handlePanLeft}
            >
              <SkipPreviousIcon />
            </IconButton>
          </Grid>
          <Grid
            item
            width="92%"
            sx={{ borderLeft: 0.5, borderRight: 0.5, ml: 1, mr: 1 }}
          >
            <AirbnbSlider
              slots={{ thumb: AirbnbThumbComponent }}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="off"
              min={0}
              max={100}
              sx={{ mt: 0.5, mb: 0.5 }}
            />
          </Grid>
          <Grid item width="3%" sx={{ bgcolor: "" }}>
            <IconButton
              color="secondary"
              aria-label="pan-right"
              onClick={handlePanRight}
            >
              <SkipNextIcon />
            </IconButton>
          </Grid>
          <Grid item width="3%" sx={{ bgcolor: "" }}></Grid>
          <Grid item width="46%" sx={{}}>
            <Typography
              variant="body2"
              sx={{
                minWidth: "40px",
                ml: 0,
                bgcolor: "primary",
                fontSize: 10,
              }}
            >
              {Math.round(timeRange.minTime * 1000) / 1000} s
            </Typography>
          </Grid>
          <Grid
            item
            width="46%"
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Typography
              variant="body2"
              sx={{
                minWidth: "40px",
                mr: -2,
                bgcolor: "primary",
                fontSize: 10,
              }}
            >
              {Math.round(timeRange.maxTime * 1000) / 1000} s
            </Typography>
          </Grid>
          <Grid item width="3%" sx={{ bgcolor: "" }}></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ChartFooter;

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === "light" ? "#444444" : "#999999",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 27,
    width: 27,
    backgroundColor: "#fff",
    border: "1px solid currentColor",
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },
  "& .MuiSlider-track": {
    height: 3,
  },
  "& .MuiSlider-rail": {
    color: "#d8d8d8",
    opacity: 1,
    height: 3,
    ...theme.applyStyles("dark", {
      color: "#bfbfbf",
      opacity: undefined,
    }),
  },
}));

interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> {}

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}
