import { useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import MultipleAxisChart from "./MultipleAxisChart";
import SingleAxisChart from "./SingleAxisChart";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

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
    primaryTime: number;
    primaryTimestamp: string;
    secondary: number;
    secondaryTime: number;
    secondaryTimestamp: string;
  };
  onAxisClick: (
    dataIndex: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => void;
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
    cursorReduced: cursorValues.primary,
    time: cursorValues.primaryTime,
    timestamp: cursorValues.primaryTimestamp,
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
    cursorReduced: cursorValues.secondary,
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
      axisValue,
      timestamp,
      secondaryIndex,
      secondaryValue,
      secondaryTimestamp
    );
  };

  // TODO: REDO THIS LOGIC TO CONCIDE WITH SAMPLES IN THE REDUCED ARRAY
  // TODO: ensure zero is always present
  const calculateTickInterval = () => {
    if (timeValues_original === undefined) return;

    let minValue = timeValues_original[0];
    let maxValue = timeValues_original[timeValues_original.length - 1];
    let duration = maxValue - minValue;
    let startTime =
      (presentZoomValues.startPercent / 100) * duration + minValue;
    let endTime = (presentZoomValues.endPercent / 100) * duration + minValue;
    let timeDiff = Math.abs(endTime - startTime);

    let firstTick = Math.round(startTime * 100) / 100;
    let lastTick = Math.round(endTime * 100) / 100;
    let tickSize: number = 0;

    if (timeDiff >= 0.2) tickSize = Math.round((timeDiff / 15) * 100) / 100;
    else tickSize = Math.round((timeDiff / 15) * 1000) / 1000;

    let tickIntervalArray: number[] = [];

    for (let i = firstTick + tickSize / 2; i <= lastTick; i = i + tickSize) {
      timeDiff >= 0.2
        ? tickIntervalArray.push(Math.round(i * 100) / 100)
        : tickIntervalArray.push(Math.round(i * 1000) / 1000);
    }
    setTickInterval(tickIntervalArray);
  };

  // TODO: ensure zero is always present
  const reduceAllArrays = () => {
    let MAX_SAMPLE_DISPLAYED = 500;

    let diff_sample_count =
      (timeValues_original.length *
        (presentZoomValues.endPercent - presentZoomValues.startPercent)) /
      100;

    skipCount = Math.round(diff_sample_count / MAX_SAMPLE_DISPLAYED);
    if (skipCount === 0) skipCount = 1;

    // original indexes
    let tempIndexes = [];
    for (let i = 0; i < timeValues_original.length; i++) {
      if (i % skipCount === 0) {
        tempIndexes.push(i);
      }
    }
    setOriginalIndexes(tempIndexes);

    // time values and time stamps
    setTimeValues(reduceValues(timeValues_original, skipCount));
    setTimeStamps(reduceValues(timeStamps_original, skipCount));

    // analog signals
    let temp: number[][] = [];
    for (let i = 0; i < 6; i++)
      temp.push(reduceValues(analog_Values_original[i], skipCount));
    setAnalogValues_filtered(temp);

    // digital signals
    temp = [];
    for (let i = 0; i < 4; i++)
      temp.push(reduceValues(digital_Values_original[i], skipCount));
    setDigitalValues_filtered(temp);

    let tempVal = reduceValues(timeValues_original, skipCount);
    let timeInd = 0;

    // // Update the trigger point
    // timeInd = tempVal.findIndex((element) => element === 0);
    // if (timeInd !== -1) setTriggerPoint(0);
    // else {
    //   timeInd = tempVal.findIndex((element) => element > 0);
    //   setTriggerPoint(tempVal[timeInd]);
    // }

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
  };

  const reduceValues = (values: any[], skipCount: number) => {
    let returnValues: any[] = [];

    let j = 0;
    for (let i = 0; i < values.length; i++) {
      if (i % skipCount === 0) {
        returnValues[j] = values[i];
        j++;
      }
    }
    return returnValues;
  };

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
    calculateTickInterval();
  }

  if (
    presentZoomValues.startPercent !== prevZoomValue[0] ||
    presentZoomValues.endPercent !== prevZoomValue[1]
  ) {
    setPrevZoomValue([
      presentZoomValues.startPercent,
      presentZoomValues.endPercent,
    ]);
    reduceAllArrays();
    calculateTickInterval();
  }

  return (
    <Card sx={{ mt: 0.2, ml: 0, mb: 0, height: `calc(100vh - 290px)` }}>
      <CardContent sx={{ height: `calc(100%)`, bgcolor: "" }}>
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
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBody;
