// MUI components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

// Out Components
import MultipleAxisChart from "./MultipleAxisChart";
import SingleAxisChart from "./SingleAxisChart";

interface Props {
  plotName: string;
  analogSignalNames: string[];
  digitalSignalNames: string[];
  analogValues_window: number[][];
  digitalValues_window: number[][];
  timeValues: number[];
  timeStamps: string[];
  originalIndexes: number[];
  tickInterval: number[];
  markerStatus: boolean;
  cursorValues: {
    primary: number;
    primaryReduced: number;
    primaryTime: number;
    primaryTimestamp: string;
    secondary: number;
    secondaryReduced: number;
    secondaryTime: number;
    secondaryTimestamp: string;
  };
  onAxisClick: (
    dataIndex: number,
    dataIndexReduced: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    secondaryIndexRedduced: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => void;
  presentMaxisYZoomValues: {
    start: number;
    end: number;
  }[];
  presentSaxisYZoomValues: {
    start: number;
    end: number;
  }[];
}

const ChartBody = ({
  plotName,
  analogSignalNames,
  digitalSignalNames,
  analogValues_window,
  digitalValues_window,
  timeValues,
  timeStamps,
  originalIndexes,
  tickInterval,
  markerStatus,
  cursorValues,
  onAxisClick,
  presentMaxisYZoomValues,
  presentSaxisYZoomValues,
}: Props) => {
  if (
    analogSignalNames === undefined ||
    digitalSignalNames === undefined ||
    analogValues_window === undefined ||
    analogValues_window[0].length === 0 ||
    digitalValues_window === undefined
  )
    return (
      <Card sx={{ mt: 0.2, ml: 0, mb: 0, height: `calc(100vh - 290px)` }}>
        <CardContent sx={{ height: `calc(100%)`, bgcolor: "" }}>
          <Box sx={{ display: "flex-box", mt: 10, ml: 1, mb: 2 }}>
            <Typography variant="overline" component="div" color="primary">
              LOADING PLEASE WAIT ...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );

  // OTHER VARIABLES

  // EVENT HANDLERS
  const handleAxisClick = (
    dataIndex: number,
    reducedIndex: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    reducedSecondaryIndex: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => {
    onAxisClick(
      dataIndex,
      reducedIndex,
      axisValue,
      timestamp,
      secondaryIndex,
      reducedSecondaryIndex,
      secondaryValue,
      secondaryTimestamp
    );
  };

  return (
    <Card sx={{ mt: 0.2, ml: 0, mb: 0, height: `calc(100vh - 290px)` }}>
      <CardContent
        sx={{ height: `calc(100vh - 290px)`, bgcolor: "", padding: 0 }}
      >
        {plotName === "SingleAxis" ? (
          <SingleAxisChart
            analogSignalNames={analogSignalNames}
            digitalSignalNames={digitalSignalNames}
            analogValues_window={analogValues_window}
            digitalValues_window={digitalValues_window}
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            presentSaxisYZoomValues={presentSaxisYZoomValues}
          />
        ) : (
          <MultipleAxisChart
            analogSignalNames={analogSignalNames}
            analogValues_window={analogValues_window}
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            presentMaxisYZoomValues={presentMaxisYZoomValues}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBody;
