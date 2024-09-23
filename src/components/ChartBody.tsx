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
  toolTipStatus: boolean;
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
  toolTipStatus,
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
  const [analogValues_filtered, setAnalogValues_filtered] = useState<
    number[][]
  >([[], [], [], [], [], []]);
  const [digitalValues_filtered, setDigitalValues_filtered] = useState<
    number[][]
  >([[], [], [], []]);

  const [originalIndexes, setOriginalIndexes] = useState<number[]>([]);
  const [timeValues, setTimeValues] = useState<number[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);

  const [prevPointCount, setPrevPointCount] = useState(500);
  const [prevAnalogSignalNames, setPrevAnalogSignalNames] =
    useState(analogSignalNames);

  // OTHER VARIABLES
  let skipCount = 10;

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

    // time values and time stamps
    setTimeValues(reduceValues(timeValues_original, tempIndexes));
    setTimeStamps(reduceValues(timeStamps_original, tempIndexes));

    // analog signals
    let temp: number[][] = [];
    for (let i = 0; i < 6; i++)
      temp.push(reduceValues(analog_Values_original[i], tempIndexes));
    setAnalogValues_filtered(temp);

    // digital signals
    temp = [];
    for (let i = 0; i < 4; i++)
      temp.push(reduceValues(digital_Values_original[i], tempIndexes));
    setDigitalValues_filtered(temp);

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

    let pc = primaryCursor;
    if (timeInd !== -1)
      setPrimaryCursor({
        cursor: pc.cursor,
        cursorReduced: timeInd,
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
        cursorReduced: timeInd,
        time: sc.time,
        timestamp: sc.timestamp,
      });

    // CALCULATE TICK INTERVALS
    let startPercent_index =
      (presentZoomValues.startPercent / 100) * timeValues_original.length;
    let endPercent_index =
      (presentZoomValues.endPercent / 100) * timeValues_original.length;

    // console.log(startPercent_index, endPercent_index, indexDiff);
    // console.log(tempIndexes);

    let startIndex = tempIndexes.findIndex(
      (element) => element >= startPercent_index
    );
    // console.log(startIndex, tempIndexes[startIndex]);

    let endIndex = tempIndexes.findIndex(
      (element) => element >= endPercent_index - 1
    );
    if (endIndex === -1) endIndex = tempIndexes.length - 1;
    // console.log(endIndex, tempIndexes[endIndex]);

    let tickSize = Math.round((endIndex - startIndex) / MAX_TICKS);
    if (tickSize === 0) tickSize = 1;

    // console.log(tickSize);

    let tickIntervalArray: number[] = [];
    for (let i = startIndex; i <= endIndex; i++)
      if (i % tickSize === 0) {
        tickIntervalArray.push(timeValues_original[tempIndexes[i]]);
      }
    // console.log(tickIntervalArray);
    setTickInterval(tickIntervalArray);
  };

  const reduceValues = (values: any[], requiredIndexes: number[]) => {
    let returnValues: any[] = [];

    for (let i = 0; i <= requiredIndexes.length; i++) {
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

  // console.log("chart body: ", primaryCursor);
  return (
    <Card sx={{ mt: 0.2, ml: 0, mb: 0, height: `calc(100vh - 290px)` }}>
      <CardContent
        sx={{ height: `calc(100vh - 290px)`, bgcolor: "", padding: 0 }}
      >
        {plotName === "SingleAxis" ? (
          <SingleAxisChart
            analogSignalNames={analogSignalNames}
            digitalSignalNames={digitalSignalNames}
            analogValues_filtered={analogValues_filtered}
            digitalValues_filtered={digitalValues_filtered}
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            presentZoomValues={{
              startPercent: presentZoomValues.startPercent,
              endPercent: presentZoomValues.endPercent,
            }}
            tickInterval={tickInterval}
            toolTipStatus={toolTipStatus}
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
            analogValues_filtered={analogValues_filtered}
            timeValues={timeValues}
            timeStamps={timeStamps}
            originalIndexes={originalIndexes}
            presentZoomValues={{
              startPercent: presentZoomValues.startPercent,
              endPercent: presentZoomValues.endPercent,
            }}
            tickInterval={tickInterval}
            toolTipStatus={toolTipStatus}
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
