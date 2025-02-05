// MUI components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { GridRowSelectionModel } from "@mui/x-data-grid-pro";

// Out Components
import MultipleAxisChart from "./MultipleAxisChart";
import SingleAxisChart from "./SingleAxisChart";

interface Props {
  plotName: string;
  selectedIndex: number;
  digitalChannelCount: number[];
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
    secondaryIndexReduced: number,
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
  onSinglePlotSelected: (plotNumber: number) => void;
  onMultipleAxisPlotSelected: (plotNumber: number) => void;
  rowSelectionModel: GridRowSelectionModel;
  digitalRowSelectionModel: GridRowSelectionModel;
}

const ChartBody = ({
  plotName,
  selectedIndex,
  digitalChannelCount,
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
  onSinglePlotSelected,
  onMultipleAxisPlotSelected,
  rowSelectionModel,
  digitalRowSelectionModel,
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
  let selectedWaveform = new Array(analogSignalNames.length).fill(false);
  let id_temp = ["IA", "IB", "IC", "IN", "VA", "VB", "VC"];

  if (rowSelectionModel !== undefined) {
    let j = 0;
    let station_count = 1;
    let temp_name = "";
    if (selectedIndex === -1) {
      for (let i = 0; i < selectedWaveform.length; i++) {
        temp_name = id_temp[j] + "-" + station_count;
        selectedWaveform[i] = rowSelectionModel.some((waveform: any) => {
          return waveform === temp_name;
        });
        j++;
        if (j > 6) {
          j = 0;
          station_count = station_count + 1;
        }
      }
    } else {
      station_count = selectedIndex + 1;
      for (let i = 0; i < selectedWaveform.length; i++) {
        temp_name = id_temp[j] + "-" + station_count;
        selectedWaveform[i] = rowSelectionModel.some((waveform: any) => {
          return waveform === temp_name;
        });
        j++;
      }
    }
  }

  let selectedDigitalWaveform = new Array(digitalSignalNames.length).fill(
    false
  );

  if (digitalRowSelectionModel !== undefined) {
    let j = 1;
    let station_count = 1;
    let temp_name = "";
    if (selectedIndex === -1) {
      for (let i = 0; i < selectedDigitalWaveform.length; i++) {
        temp_name = "D" + j + "-" + station_count;
        selectedDigitalWaveform[i] = digitalRowSelectionModel.some(
          (waveform: any) => {
            return waveform === temp_name;
          }
        );
        j++;
        if (j > digitalChannelCount[station_count]) {
          j = 1;
          station_count = station_count + 1;
        }
      }
    } else {
      station_count = selectedIndex + 1;
      for (let i = 0; i < selectedDigitalWaveform.length; i++) {
        j = i + 1;
        temp_name = "D" + j + "-" + station_count;

        selectedDigitalWaveform[i] = digitalRowSelectionModel.some(
          (waveform: any) => {
            return waveform === temp_name;
          }
        );
      }
    }
  }

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
        {plotName === "SingleAxis" || plotName === "MergeSingleView" ? (
          <SingleAxisChart
            digitalChannelCount={digitalChannelCount}
            analogSignalNames={analogSignalNames}
            digitalSignalNames={digitalSignalNames}
            analogValues_window={analogValues_window}
            digitalValues_window={digitalValues_window}
            stationCount={
              plotName === "SingleAxis"
                ? 1
                : Math.round(selectedWaveform.length / 7)
            }
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            presentSaxisYZoomValues={presentSaxisYZoomValues}
            onSinglePlotSelected={onSinglePlotSelected}
            selectedWaveform={selectedWaveform}
            selectedDigitalWaveform={selectedDigitalWaveform}
          />
        ) : (
          <MultipleAxisChart
            analogSignalNames={analogSignalNames}
            analogValues_window={analogValues_window}
            stationCount={
              plotName === "MultipleAxis"
                ? 1
                : Math.round(selectedWaveform.length / 7)
            }
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            presentMaxisYZoomValues={presentMaxisYZoomValues}
            onMultipleAxisPlotSelected={onMultipleAxisPlotSelected}
            selectedWaveform={selectedWaveform}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBody;
