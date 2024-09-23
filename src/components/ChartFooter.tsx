import { useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

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

const ChartFooter = ({ timeRange, presentZoomValues, onZoomChange }: Props) => {
  const [prevZoomValues, setPrevZoomValues] = useState([0, 0]);
  const [value, setValue] = useState<number[]>([
    presentZoomValues.startPercent,
    presentZoomValues.endPercent,
  ]);
  let minDistance = 1;

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
        setValue([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue([clamped - minDistance, clamped]);
      }
    } else {
      setValue(newValue as number[]);
    }
    onZoomChange(newValue[0], newValue[1]);
  };

  // STORE NEW ZOOM VALUE TO ENABLE ZOOM STATE CHANGE DETECTION
  if (
    prevZoomValues[0] !== presentZoomValues.startPercent ||
    prevZoomValues[1] !== presentZoomValues.endPercent
  ) {
    setPrevZoomValues([
      presentZoomValues.startPercent,
      presentZoomValues.endPercent,
    ]);
    setValue([presentZoomValues.startPercent, presentZoomValues.endPercent]);
  }

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
        <Box
          sx={{
            height: "70px",
            width: "100%",
            pt: 1,
            pl: 2,
            pr: 0,
            bgcolor: "",
          }}
        >
          <Box
            sx={{
              width: "100%",
              bgcolor: "",
              borderLeft: 0.5,
              borderRight: 0.5,
            }}
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
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
          </Box>
        </Box>
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
