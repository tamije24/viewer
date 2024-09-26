import { useState } from "react";

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
  analog_Values_original: number[][];
  digital_Values_original: number[][];
  timeValues_original: number[];
  timeStamps_original: string[];
  presentZoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  };
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
  pointCount: number;
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
  analog_Values_original,
  digital_Values_original,
  timeValues_original,
  timeStamps_original,
  presentZoomValues,
  markerStatus,
  cursorValues,
  onAxisClick,
  pointCount,
  presentMaxisYZoomValues,
  presentSaxisYZoomValues,
}: Props) => {
  if (
    analogSignalNames === undefined ||
    digitalSignalNames === undefined ||
    analog_Values_original === undefined ||
    digital_Values_original === undefined
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

  // STATE VARIABLES
  const [primaryCursor, setPrimaryCursor] = useState({
    cursor: cursorValues.primary,
    cursorReduced: cursorValues.primaryReduced,
    time: cursorValues.primaryTime,
    timestamp: cursorValues.primaryTimestamp,
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
    cursorReduced: cursorValues.secondaryReduced,
    time: cursorValues.secondaryTime,
    timestamp: cursorValues.secondaryTimestamp,
  });
  const [tickInterval, setTickInterval] = useState<number[]>([]);
  const [prevZoomValue, setPrevZoomValue] = useState<number[]>([0, 100]);
  // const [analogValues_filtered, setAnalogValues_filtered] = useState<
  //   number[][]
  // >([[], [], [], [], [], []]);
  // const [digitalValues_filtered, setDigitalValues_filtered] = useState<
  //   number[][]
  // >([[], [], [], []]);
  const [originalIndexes, setOriginalIndexes] = useState<number[]>([]);
  const [timeValues, setTimeValues] = useState<number[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);

  const [windowLimits, setWindowLimits] = useState([0, 0]);
  const [analogValues_window, setAnalogValues_window] = useState<number[][]>([
    [],
    [],
    [],
    [],
  ]);
  const [digitalValues_window, setDigitalValues_window] = useState<number[][]>([
    [],
    [],
    [],
    [],
  ]);

  const [prevPointCount, setPrevPointCount] = useState(500);
  const [prevAnalogSignalNames, setPrevAnalogSignalNames] =
    useState(analogSignalNames);

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
    setPrimaryCursor({
      cursor: dataIndex,
      cursorReduced: reducedIndex,
      time: axisValue,
      timestamp: timestamp,
    });

    setSecondaryCursor({
      cursor: secondaryIndex,
      cursorReduced: reducedSecondaryIndex,
      time: secondaryValue,
      timestamp: secondaryTimestamp,
    });

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

  const reduceAllArrays = () => {
    // console.log("reduce arrays");
    // console.log("time values: ", timeValues);
    let skipCount = 10;
    let MAX_SAMPLE_DISPLAYED = pointCount;
    const MAX_TICKS = 16;

    let zeroIndex = timeValues_original.findIndex((element) => element === 0);
    if (zeroIndex === -1) {
      zeroIndex = 0;
      console.log(timeValues_original);
    }

    let diff_sample_count =
      (timeValues_original.length *
        (presentZoomValues.endPercent - presentZoomValues.startPercent)) /
      100;

    skipCount = Math.round(diff_sample_count / MAX_SAMPLE_DISPLAYED);
    if (skipCount === 0) skipCount = 1;

    // original indexes
    let tempIndexes = calculateIndexes(
      timeValues_original.length,
      skipCount,
      zeroIndex
    );
    setOriginalIndexes(tempIndexes);

    // console.log(tempIndexes);

    // time values and time stamps
    setTimeValues(reduceValues(timeValues_original, tempIndexes));
    setTimeStamps(reduceValues(timeStamps_original, tempIndexes));

    // console.log(
    //   "recalc time values: ",
    //   reduceValues(timeValues_original, tempIndexes)
    // );

    // Determine plotting window
    let startPercent_index =
      (presentZoomValues.startPercent / 100) * timeValues_original.length;
    let endPercent_index =
      (presentZoomValues.endPercent / 100) * timeValues_original.length;

    let startIndex = tempIndexes.findIndex(
      (element) => element >= startPercent_index
    );

    let endIndex = tempIndexes.findIndex(
      (element) => element >= endPercent_index - 1
    );
    if (endIndex === -1) endIndex = tempIndexes.length - 1;

    setWindowLimits([startIndex, endIndex]);

    // analog signals filtered - full array
    let temp: number[][] = [];
    for (let i = 0; i < 6; i++)
      temp.push(reduceValues(analog_Values_original[i], tempIndexes));
    // setAnalogValues_filtered(temp);

    // analog signals filtered - plot window
    let temp_window: number[][] = [];
    for (let i = 0; i < 6; i++) {
      temp_window.push(temp[i].slice(startIndex, endIndex));
    }
    setAnalogValues_window(temp_window);

    // digital signals filtered - full array
    temp = [];
    for (let i = 0; i < 4; i++)
      temp.push(reduceValues(digital_Values_original[i], tempIndexes));
    //setDigitalValues_filtered(temp);

    // digital signals filtered - plot window
    temp_window = [];
    for (let i = 0; i < 4; i++) {
      temp_window.push(temp[i].slice(startIndex, endIndex));
    }
    setDigitalValues_window(temp_window);

    let tempVal = reduceValues(timeValues_original, tempIndexes);
    let timeInd = 0;

    // Update primary cursor
    timeInd = tempVal.findIndex(
      (element) => element === timeValues_original[primaryCursor.cursor]
    );

    if (timeInd === -1)
      timeInd = tempVal.findIndex(
        (element) => element > timeValues_original[primaryCursor.cursor]
      );

    // console.log("index: ", timeInd);

    let pc = primaryCursor;
    if (timeInd !== -1)
      setPrimaryCursor({
        cursor: pc.cursor,
        cursorReduced: timeInd - startIndex,
        time: pc.time,
        timestamp: pc.timestamp,
      });

    // Update secondary cursor
    timeInd = tempVal.findIndex(
      (element) => element === timeValues_original[secondaryCursor.cursor]
    );
    if (timeInd === -1)
      timeInd = tempVal.findIndex(
        (element) => element > timeValues_original[secondaryCursor.cursor]
      );

    let sc = secondaryCursor;
    if (timeInd !== -1)
      setSecondaryCursor({
        cursor: sc.cursor,
        cursorReduced: timeInd - startIndex,
        time: sc.time,
        timestamp: sc.timestamp,
      });

    // CALCULATE TICK INTERVALS

    // determine tick size
    let tickSize = Math.round((endIndex - startIndex) / MAX_TICKS);
    if (tickSize === 0) tickSize = 1;

    // find the index corresponding to zero in the reduced tiem array
    zeroIndex = tempVal.findIndex((element) => element === 0);
    if (zeroIndex === -1) {
      zeroIndex = 0;
    }

    let tickIntervalArray: number[] = [];

    // include zero in the tick
    tickIntervalArray.push(tempVal[zeroIndex]);

    // include ticks before zero
    for (let i = zeroIndex - tickSize; i >= 0; i = i - tickSize) {
      //if (i % tickSize === 0) {
      tickIntervalArray.push(tempVal[i]);
      //}
    }
    tickIntervalArray.reverse();

    // include ticks after zero
    for (let i = zeroIndex + tickSize; i < tempVal.length; i = i + tickSize) {
      // if (i % tickSize === 0) {
      tickIntervalArray.push(tempVal[i]);
      // }
    }
    setTickInterval(tickIntervalArray);
  };

  const reduceValues = (values: any[], requiredIndexes: number[]) => {
    let returnValues: any[] = [];

    for (let i = 0; i <= requiredIndexes.length; i++) {
      if (values[requiredIndexes[i]] !== undefined)
        returnValues[i] = values[requiredIndexes[i]];
    }
    return returnValues;
  };

  const calculateIndexes = (
    L: number,
    skipCount: number,
    zeroIndex: number
  ) => {
    let returnIndexes: number[] = [];

    let j = 0;
    returnIndexes[j] = zeroIndex;
    j++;
    for (let i = zeroIndex - 1; i >= 0; i--) {
      if (i % skipCount === 0) {
        returnIndexes[j] = i;
        j++;
      }
    }
    returnIndexes.reverse();

    for (let i = zeroIndex + 1; i < L; i++) {
      if (i % skipCount === 0) {
        returnIndexes[j] = i;
        j++;
      }
    }
    //  console.log(returnIndexes);
    return returnIndexes;
  };

  // calculate reduced values after initial loading
  if (
    analog_Values_original !== undefined &&
    analog_Values_original.length > 0 &&
    originalIndexes.length === 0
  ) {
    setPrevZoomValue([
      presentZoomValues.startPercent,
      presentZoomValues.endPercent,
    ]);
    reduceAllArrays();
  }

  // recalculate when station changes
  if (prevAnalogSignalNames != analogSignalNames) {
    setPrevAnalogSignalNames(analogSignalNames);
    reduceAllArrays();
  }

  // recalculate when zoom changes
  if (
    presentZoomValues.startPercent !== prevZoomValue[0] ||
    presentZoomValues.endPercent !== prevZoomValue[1]
  ) {
    setPrevZoomValue([
      presentZoomValues.startPercent,
      presentZoomValues.endPercent,
    ]);
    reduceAllArrays();
  }

  // recalculate when display point count changes
  if (prevPointCount !== pointCount) {
    setPrevPointCount(pointCount);
    reduceAllArrays();
  }

  // update cursors
  if (
    primaryCursor.cursor !== cursorValues.primary ||
    secondaryCursor.cursor != cursorValues.secondary
  ) {
    setPrimaryCursor({
      cursor: cursorValues.primary,
      cursorReduced: cursorValues.primaryReduced,
      time: cursorValues.primaryTime,
      timestamp: cursorValues.primaryTimestamp,
    });

    setSecondaryCursor({
      cursor: cursorValues.secondary,
      cursorReduced: cursorValues.secondaryReduced,
      time: cursorValues.secondaryTime,
      timestamp: cursorValues.secondaryTimestamp,
    });
  }

  // console.log("chart body");
  // console.log(windowLimits[0], windowLimits[1]);
  // console.log(timeValues);
  // console.log(
  //   "chart body: ",
  //   primaryCursor.cursor,
  //   primaryCursor.cursorReduced
  // );

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
            timeValues={timeValues.slice(windowLimits[0], windowLimits[1])}
            timeStamps={timeStamps.slice(windowLimits[0], windowLimits[1])}
            originalIndexes={originalIndexes.slice(
              windowLimits[0],
              windowLimits[1]
            )}
            // presentZoomValues={{
            //   startPercent: presentZoomValues.startPercent,
            //   endPercent: presentZoomValues.endPercent,
            // }}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={{
              primary: primaryCursor.cursor,
              primaryReduced: primaryCursor.cursorReduced,
              primaryTime: primaryCursor.time,
              primaryTimestamp: primaryCursor.timestamp,
              secondary: secondaryCursor.cursor,
              secondaryReduced: secondaryCursor.cursorReduced,
              secondaryTime: secondaryCursor.time,
              secondaryTimestamp: secondaryCursor.timestamp,
            }}
            onAxisClick={handleAxisClick}
            presentSaxisYZoomValues={presentSaxisYZoomValues}
          />
        ) : (
          <MultipleAxisChart
            analogSignalNames={analogSignalNames}
            analogValues_window={analogValues_window}
            timeValues={timeValues.slice(windowLimits[0], windowLimits[1])}
            timeStamps={timeStamps.slice(windowLimits[0], windowLimits[1])}
            originalIndexes={originalIndexes.slice(
              windowLimits[0],
              windowLimits[1]
            )}
            // presentZoomValues={{
            //   startPercent: presentZoomValues.startPercent,
            //   endPercent: presentZoomValues.endPercent,
            // }}
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={{
              primary: primaryCursor.cursor,
              primaryReduced: primaryCursor.cursorReduced,
              primaryTime: primaryCursor.time,
              primaryTimestamp: primaryCursor.timestamp,
              secondary: secondaryCursor.cursor,
              secondaryReduced: secondaryCursor.cursorReduced,
              secondaryTime: secondaryCursor.time,
              secondaryTimestamp: secondaryCursor.timestamp,
            }}
            onAxisClick={handleAxisClick}
            presentMaxisYZoomValues={presentMaxisYZoomValues}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBody;
