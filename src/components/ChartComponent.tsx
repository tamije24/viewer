import { useState } from "react";

// MUI COMPONENTS
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Our components
import ChartBody from "./ChartBody";
import ChartFooter from "./ChartFooter";
import ChartHeader from "./ChartHeader";
import CursorValues from "./CursorValues";

// Our Services
import { AnalogSignal } from "../services/analog-signal-service";
import { DigitalSignal } from "../services/digital-signal-service";
import { AnalogChannel } from "../services/analog-channel-service";
import { Phasor } from "../services/phasor-service";

interface Props {
  stationName: string;
  plotName: string;
  analogSignals: AnalogSignal[];
  analogSignalNames: string[];
  digitalSignals: DigitalSignal[];
  digitalSignalNames: string[];
  error: string;
  isAnLoading: boolean;
  isDigLoading: boolean;
  presentZoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  };
  changePresentZoomLimit: (zoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  }) => void;

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

  analogChannelInfo: AnalogChannel[];
  dftPhasors: Phasor[];
  sampling_frequency: number;
  pointCount: number;
  sidebarStatus: boolean;
  tooltipStatus: boolean;
  selectedFile: number;
  projectId: number;
}

const ChartComponent = ({
  stationName,
  plotName,
  analogSignals,
  analogSignalNames,
  digitalSignals,
  digitalSignalNames,
  error,
  isAnLoading,
  isDigLoading,
  presentZoomValues,
  changePresentZoomLimit,
  cursorValues,
  onAxisClick,
  analogChannelInfo,
  dftPhasors,
  sampling_frequency,
  pointCount,
  sidebarStatus,
  tooltipStatus,
  selectedFile,
  projectId,
}: Props) => {
  // STATE VARIABLES
  const [markerStatus, setMarkerStatus] = useState(false);

  const [usedAnalogSignalNames, setUsedAnalogSignalNames] =
    useState(analogSignalNames);

  const [presentMaxisYZoomValues, setPresentMaxisYZoomValues] = useState<
    {
      start: number;
      end: number;
    }[]
  >([
    { start: 0, end: 100 },
    { start: 0, end: 100 },
    { start: 0, end: 100 },
    { start: 0, end: 100 },
    { start: 0, end: 100 },
    { start: 0, end: 100 },
  ]);

  const [presentSaxisYZoomValues, setPresentSaxisYZoomValues] = useState<
    {
      start: number;
      end: number;
    }[]
  >([
    { start: 0, end: 100 },
    { start: 0, end: 100 },
  ]);

  const [tableValues, setTableValues] = useState<
    {
      id: string;
      channel: string;
      unit: string;
      inst: number;
      phasor_mag: number;
      phasor_ang: number;
      true_rms: number;
      pos_peak: number;
      neg_peak: number;
    }[]
  >([]);

  // STATE VARIABLES

  const [tickInterval, setTickInterval] = useState<number[]>([]);
  const [prevZoomValue, setPrevZoomValue] = useState<number[]>([0, 100]);
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
  let primaryCursor = {
    cursor: cursorValues.primary,
    cursorReduced: cursorValues.primaryReduced,
    time: cursorValues.primaryTime,
    timestamp: cursorValues.primaryTimestamp,
  };

  let secondaryCursor = {
    cursor: cursorValues.secondary,
    cursorReduced: cursorValues.secondaryReduced,
    time: cursorValues.secondaryTime,
    timestamp: cursorValues.secondaryTimestamp,
  };
  const plotSubtitle =
    plotName === "SingleAxis" ? "Single Axis View" : "Multiple Axis View";

  let analog_Values_original: number[][] = [];
  let digital_Values_original: number[][] = [];
  let timeValues_original: number[] = [];
  let timeStamps_original: string[] = [];

  const ZOOM_STEP = 5;

  // If error in getting data from backend, display error message
  if (error)
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 1, mb: 2 }}>
        <Typography variant="overline" component="div" color="firebrick">
          {error}
        </Typography>
      </Box>
    );

  // If no error proceed with reading data ....

  // EVENT HANDLERS
  // RESET button in the Chart header
  const handleZoomOutClick = () => {
    let minTime = 0;
    let maxTime = 0;
    if (analogSignals !== undefined) {
      let L = analogSignals.length;
      minTime = Object.values(analogSignals[0])[0];
      maxTime = Object.values(analogSignals[L - 1])[0];
    }

    changePresentZoomLimit({
      startPercent: 0,
      endPercent: 100,
      startTime: minTime,
      endTime: maxTime,
    });
  };

  // ZOOM IN button in the Chart header
  const handleZoomInClick = (fromValue: number, toValue: number) => {
    let duration = 0;
    let minTime = 0;
    if (analogSignals !== undefined) {
      let L = analogSignals.length;
      let maxTime = Object.values(analogSignals[L - 1])[0];
      minTime = Object.values(analogSignals[0])[0];
      duration = maxTime - minTime;
    }
    changePresentZoomLimit({
      startPercent:
        duration !== 0 ? ((fromValue - minTime) / duration) * 100 : 0,
      endPercent: duration !== 0 ? ((toValue - minTime) / duration) * 100 : 0,
      startTime: fromValue,
      endTime: toValue,
    });
  };

  // SLIDER ZOOM position changed
  const handleZoomChange = (fromValue: number, toValue: number) => {
    let duration = 0;
    let minTime = 0;
    if (analogSignals !== undefined) {
      let L = analogSignals.length;
      let maxTime = Object.values(analogSignals[L - 1])[0];
      minTime = Object.values(analogSignals[0])[0];
      duration = maxTime - minTime;
    }
    changePresentZoomLimit({
      startPercent: fromValue,
      endPercent: toValue,
      startTime: (fromValue / 100) * duration + minTime,
      endTime: (toValue / 100) * duration + minTime,
    });
  };

  // MARKER in Chart header
  const handleMarkerStatusChange = (tTStatus: boolean) => {
    setMarkerStatus(tTStatus);
  };

  // AXIS click handler
  const handleAxisClick = (
    dataIndex: number,
    dataIndexReduced: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    secondaryIndexReduced: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => {
    primaryCursor = {
      cursor: dataIndex,
      cursorReduced: dataIndexReduced,
      time: axisValue,
      timestamp: timestamp,
    };

    // console.log("handle axis - ", primaryCursor);
    // console.log(originalIndexes);

    secondaryCursor = {
      cursor: secondaryIndex,
      cursorReduced: secondaryIndexReduced,
      time: secondaryValue,
      timestamp: secondaryTimestamp,
    };

    onAxisClick(
      dataIndex,
      dataIndexReduced,
      axisValue,
      timestamp,
      secondaryIndex,
      secondaryIndexReduced,
      secondaryValue,
      secondaryTimestamp
    );

    fillSideTable();
  };

  // Y-Axis Zoom handler
  const handleYZoomClick = (signal: string, zoomType: number) => {
    plotName === "SingleAxis"
      ? handleSAxisYZoomClick(signal, zoomType)
      : handleMAxisYZoomClick(signal, zoomType);
  };

  const handleSAxisYZoomClick = (signal: string, zoomType: number) => {
    // Check which signal is selected
    let index = 0;
    if (signal === "Currents") index = 0;
    else if (signal === "Voltages") index = 1;

    let present_zoom_start = presentSaxisYZoomValues[index].start;
    let present_zoom_end = presentSaxisYZoomValues[index].end;

    if (zoomType === 3) {
      // reset button clicked
      present_zoom_start = 0;
      present_zoom_end = 100;
    } else if (zoomType === 1) {
      // zoom-in button clicked
      if (present_zoom_start !== 45 && present_zoom_end !== 55) {
        present_zoom_start = present_zoom_start + ZOOM_STEP;
        present_zoom_end = present_zoom_end - ZOOM_STEP;
      }
    } else if (zoomType === 2) {
      // zoom-out button clicked
      if (present_zoom_start !== 0 && present_zoom_end !== 100) {
        present_zoom_start = present_zoom_start - ZOOM_STEP;
        present_zoom_end = present_zoom_end + ZOOM_STEP;
      }
    } else if (zoomType === 4) {
      // Pan-up button clicked
      if (present_zoom_end !== 100) {
        present_zoom_start = present_zoom_start + ZOOM_STEP;
        present_zoom_end = present_zoom_end + ZOOM_STEP;
      }
    } else if (zoomType === 5) {
      // Pan-down button clicked
      if (present_zoom_start !== 0) {
        present_zoom_start = present_zoom_start - ZOOM_STEP;
        present_zoom_end = present_zoom_end - ZOOM_STEP;
      }
    }

    if (present_zoom_start < 0) present_zoom_start = 0;
    if (present_zoom_end > 100) present_zoom_end = 100;

    let tempZoom = [...presentSaxisYZoomValues];

    tempZoom[index] = {
      start: present_zoom_start,
      end: present_zoom_end,
    };

    // update prev Y zoom values and type
    setPresentSaxisYZoomValues(tempZoom);
  };

  const handleMAxisYZoomClick = (signal: string, zoomType: number) => {
    // Check which signal is selected
    let index = 0;
    if (signal === "Ia") index = 0;
    else if (signal === "Ib") index = 1;
    else if (signal === "Ic") index = 2;
    else if (signal === "Va") index = 3;
    else if (signal === "Vb") index = 4;
    else if (signal === "Vc") index = 5;

    let present_zoom_start = presentMaxisYZoomValues[index].start;
    let present_zoom_end = presentMaxisYZoomValues[index].end;

    if (zoomType === 3) {
      // reset button clicked
      present_zoom_start = 0;
      present_zoom_end = 100;
    } else if (zoomType === 1) {
      // zoom-in button clicked
      if (present_zoom_start !== 45 && present_zoom_end !== 55) {
        present_zoom_start = present_zoom_start + ZOOM_STEP;
        present_zoom_end = present_zoom_end - ZOOM_STEP;
      }
    } else if (zoomType === 2) {
      // zoom-out button clicked
      if (present_zoom_start !== 0 && present_zoom_end !== 100) {
        present_zoom_start = present_zoom_start - ZOOM_STEP;
        present_zoom_end = present_zoom_end + ZOOM_STEP;
      }
    }

    let tempZoom = [...presentMaxisYZoomValues];
    tempZoom[index] = {
      start: present_zoom_start,
      end: present_zoom_end,
    };
    // update prev Y zoom values and type
    setPresentMaxisYZoomValues(tempZoom);
  };

  const handleCursorMove = (cursor: string, step: number) => {
    // console.log(cursor, step);
    let primary_cursor_present = primaryCursor.cursorReduced + windowLimits[0];
    let secondary_cursor_present =
      secondaryCursor.cursorReduced + windowLimits[0];

    if (cursor === "primary") {
      // primary cursor moved
      if (
        (primary_cursor_present >= timeValues.length - 1 && step === 1) ||
        (primary_cursor_present <= 0 && step === -1) ||
        primary_cursor_present + step <= secondary_cursor_present
      )
        return;

      primaryCursor = {
        cursor: originalIndexes[primary_cursor_present + step],
        cursorReduced: primary_cursor_present - windowLimits[0] + step,
        time: timeValues[primary_cursor_present + step],
        timestamp: timeStamps[primary_cursor_present + step],
      };
    } else {
      // secondary cursor moved

      if (
        (secondary_cursor_present >= timeValues.length - 1 && step === 1) ||
        (secondary_cursor_present <= 0 && step === -1) ||
        secondary_cursor_present + step >= primary_cursor_present
      )
        return;

      secondaryCursor = {
        cursor: originalIndexes[secondary_cursor_present + step],
        cursorReduced: secondary_cursor_present - windowLimits[0] + step,
        time: timeValues[secondary_cursor_present + step],
        timestamp: timeStamps[secondary_cursor_present + step],
      };
    }

    onAxisClick(
      primaryCursor.cursor,
      primaryCursor.cursorReduced,
      primaryCursor.time,
      primaryCursor.timestamp,
      secondaryCursor.cursor,
      secondaryCursor.cursorReduced,
      secondaryCursor.time,
      secondaryCursor.timestamp
    );

    fillSideTable();
  };

  // HELPER FUNCTIONS
  const arrayColumn = (arr: number[][], n: number) => arr.map((x) => x[n]);
  const strArrayColumn = (arr: string[][], n: number) => arr.map((x) => x[n]);

  // OTHER FUNCTIONS
  const reduceAllArrays = () => {
    let skipCount = 10;
    let MAX_SAMPLE_DISPLAYED = pointCount;
    const MAX_TICKS = 16;

    let zeroIndex = timeValues_original.findIndex((element) => element === 0);
    if (zeroIndex === -1) {
      zeroIndex = 0;
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
    for (let i = 0; i < 6; i++) {
      temp.push(reduceValues(analog_Values_original[i], tempIndexes));
    }

    // analog signals - plot window
    let temp_window: number[][] = [];
    for (let i = 0; i < 6; i++) {
      temp_window.push(temp[i].slice(startIndex, endIndex));
    }
    setAnalogValues_window(temp_window);

    // digital signals filtered - full array
    temp = [];
    for (let i = 0; i < 4; i++) {
      //  console.log(i);
      temp.push(reduceValues(digital_Values_original[i], tempIndexes));
      //  console.log(i);
    }

    // digital signals  - plot window
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

    //console.log("index: ", timeInd);

    let pc = primaryCursor;
    let updated_primary_reduced_index = pc.cursorReduced;
    if (timeInd !== -1) {
      primaryCursor = {
        cursor: pc.cursor,
        cursorReduced: timeInd - startIndex,
        time: pc.time,
        timestamp: pc.timestamp,
      };
      updated_primary_reduced_index = timeInd - startIndex;
    }

    // Update secondary cursor
    timeInd = tempVal.findIndex(
      (element) => element === timeValues_original[secondaryCursor.cursor]
    );
    if (timeInd === -1)
      timeInd = tempVal.findIndex(
        (element) => element > timeValues_original[secondaryCursor.cursor]
      );

    let sc = secondaryCursor;
    let updated_secondary_reduced_index = sc.cursorReduced;
    if (timeInd !== -1) {
      secondaryCursor = {
        cursor: sc.cursor,
        cursorReduced: timeInd - startIndex,
        time: sc.time,
        timestamp: sc.timestamp,
      };
      updated_secondary_reduced_index = timeInd - startIndex;
    }

    onAxisClick(
      pc.cursor,
      updated_primary_reduced_index,
      pc.time,
      pc.timestamp,
      sc.cursor,
      updated_secondary_reduced_index,
      sc.time,
      sc.timestamp
    );

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

    // if (values === undefined) return new number[];

    for (let i = 0; i <= requiredIndexes.length; i++) {
      if (values === undefined) returnValues[i] = 0;
      else if (values[requiredIndexes[i]] !== undefined)
        returnValues[i] = values[requiredIndexes[i]];
      else returnValues[i] = 0;
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

  const fillSideTable = () => {
    let dataIndex = primaryCursor.cursor;
    let secondaryIndex = secondaryCursor.cursor;

    let tempTable: {
      id: string;
      channel: string;
      unit: string;
      inst: number;
      phasor_mag: number;
      phasor_ang: number;
      true_rms: number;
      pos_peak: number;
      neg_peak: number;
    }[] = [];

    // Set table values to be displayed
    let names: string[] = [];
    if (analogSignalNames !== undefined) {
      names = [...analogSignalNames];
    } else {
      return;
    }

    let units: string[] = [];
    if (analogChannelInfo !== undefined && names.length > 0) {
      names.forEach((channel) => {
        analogChannelInfo.forEach((ac) => {
          ac.channel_name === channel ? units.push(ac.unit) : "";
        });
      });
    } else {
      return;
    }

    let sample_values =
      analogSignals !== undefined && analogSignals.length > 0
        ? Object.values(analogSignals[dataIndex])
        : new Array(7).fill(0);

    let phasor_values =
      dftPhasors !== undefined && dftPhasors.length > 0
        ? Object.values(dftPhasors[dataIndex])
        : new Array(6 * 2).fill(0);

    let ind: { start: number; end: number } =
      dataIndex > secondaryIndex
        ? { start: secondaryIndex, end: dataIndex }
        : { start: dataIndex, end: secondaryIndex };

    const a_sig = [];
    for (let i = ind.start; i < ind.end; i++) {
      let value = Object.values(analogSignals[i]);
      a_sig.push(value);
    }

    // indexes for rms
    let N = Math.round(sampling_frequency / 50);
    let end_rms = dataIndex;
    let start_rms = dataIndex > N ? dataIndex - N + 1 : 0;

    const a_sig_rms = [];
    for (let i = start_rms; i < end_rms + 1; i++) {
      let value = Object.values(analogSignals[i]);
      a_sig_rms.push(value);
    }

    let id = ["IA", "IB", "IC", "VA", "VB", "VC"];
    for (let i = 0; i < names.length; i++) {
      let label = names[i];
      let unit = units[i];
      let positivePeak =
        a_sig.length > 0 ? Math.max(...arrayColumn(a_sig, i)) : 0;
      let negativePeak =
        a_sig.length > 0 ? Math.min(...arrayColumn(a_sig, i)) : 0;

      let rowValue = {
        id: id[i],
        channel: label,
        unit: unit,
        inst: sample_values[i],
        phasor_mag: phasor_values[2 * i],
        phasor_ang: phasor_values[2 * i + 1],
        true_rms: calculateRMS([...arrayColumn(a_sig_rms, i)]),
        pos_peak: positivePeak,
        neg_peak: negativePeak,
      };
      tempTable.push(rowValue);
    }
    setTableValues(tempTable);
  };

  const calculateRMS = (values: number[]) => {
    let N = values.length;

    // squaring values
    let rmsValue = 0;
    for (let i = 0; i < N; i++) {
      rmsValue = rmsValue + values[i] * values[i];
    }

    // root and mean
    rmsValue = Math.sqrt(rmsValue / N);

    return rmsValue;
  };

  const analogSignals_split = [];
  if (!isAnLoading && analogSignals !== undefined && analogSignals.length > 0) {
    let L = analogSignals.length;
    for (let i = 0; i < L; i++) {
      let value = Object.values(analogSignals[i]);
      analogSignals_split.push(value);
    }

    timeValues_original = [];
    timeStamps_original = [];
    timeValues_original = arrayColumn(analogSignals_split, 6);
    timeStamps_original = strArrayColumn(analogSignals_split, 7);

    analog_Values_original = [];
    analog_Values_original.push(arrayColumn(analogSignals_split, 0));
    analog_Values_original.push(arrayColumn(analogSignals_split, 1));
    analog_Values_original.push(arrayColumn(analogSignals_split, 2));
    analog_Values_original.push(arrayColumn(analogSignals_split, 3));
    analog_Values_original.push(arrayColumn(analogSignals_split, 4));
    analog_Values_original.push(arrayColumn(analogSignals_split, 5));

    // console.log(arrayColumn(analogSignals_split, 7));

    if (primaryCursor.cursor === 0) {
      primaryCursor.time = timeValues_original[0];
      primaryCursor.timestamp = timeStamps_original[0];
    }

    if (secondaryCursor.cursor === 0) {
      secondaryCursor.time = timeValues_original[0];
      secondaryCursor.timestamp = timeStamps_original[0];
    }

    if (
      primaryCursor.cursor === 0 &&
      secondaryCursor.cursor === 0 &&
      tableValues.length === 0
    ) {
      setUsedAnalogSignalNames([...analogSignalNames]);
      fillSideTable();
    }
  }

  const digitalSignals_split = [];
  if (
    !isDigLoading &&
    digitalSignals !== undefined &&
    digitalSignals.length > 0
  ) {
    let L = digitalSignals.length;
    let factor = 0.3;
    for (let i = 0; i < L; i++) {
      let value = Object.values(digitalSignals[i]);
      value[0] = factor * value[0] + 0.3;
      value[1] = factor * value[1] + 1.3;
      value[2] = factor * value[2] + 2.3;
      value[3] = factor * value[3] + 3.3;
      digitalSignals_split.push(value);
    }

    // console.log(arrayColumn(digitalSignals_split, 1));

    digital_Values_original = [];
    for (let i = 0; i < 4; i++)
      digital_Values_original.push(arrayColumn(digitalSignals_split, i));
  }

  if (analogSignalNames !== undefined) {
    if (usedAnalogSignalNames === undefined) {
      setUsedAnalogSignalNames([...analogSignalNames]);
      fillSideTable();
    } else if (analogSignalNames[0] !== usedAnalogSignalNames[0]) {
      setUsedAnalogSignalNames([...analogSignalNames]);
      fillSideTable();
    }
  }

  // calculate reduced values after initial loading
  if (
    analog_Values_original !== undefined &&
    analog_Values_original.length > 0 &&
    digital_Values_original !== undefined &&
    digital_Values_original.length > 0 &&
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
    // console.log("finished reducing arrays");
  }

  // recalculate when display point count changes
  if (prevPointCount !== pointCount) {
    setPrevPointCount(pointCount);
    reduceAllArrays();
  }

  // console.log(analogSignalNames);
  // console.log(usedAnalogSignalNames);
  // console.log(
  //   "chart component: ",
  //   primaryCursor.cursor,
  //   primaryCursor.cursorReduced
  // );

  //console.log("chart comp ; ", presentZoomValues);
  return (
    <Grid container sx={{ mt: 9, ml: 0.5, mb: 0.5 }}>
      <Grid item xs={sidebarStatus ? 9 : 12}>
        <Stack>
          <ChartHeader
            stationName={stationName}
            plotSubtitle={plotSubtitle}
            timeValues_original={timeValues_original}
            presentZoomValues={presentZoomValues}
            onZoomResetClick={handleZoomOutClick}
            onZoomInClick={handleZoomInClick}
            markerStatus={markerStatus}
            onMarkerStatusChange={handleMarkerStatusChange}
            onYZoomClick={handleYZoomClick}
            timeRange={{
              minTime:
                analogSignals !== undefined && analogSignals.length > 0
                  ? Object.values(analogSignals[0])[6]
                  : 0,
              maxTime:
                analogSignals !== undefined && analogSignals.length > 0
                  ? Object.values(analogSignals[analogSignals.length - 1])[6]
                  : 0,
            }}
            tooltipStatus={tooltipStatus}
          />

          <ChartBody
            plotName={plotName}
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
            tickInterval={tickInterval}
            markerStatus={markerStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            presentMaxisYZoomValues={presentMaxisYZoomValues}
            presentSaxisYZoomValues={presentSaxisYZoomValues}
          />
          <ChartFooter
            timeRange={{
              minTime:
                analogSignals !== undefined && analogSignals.length > 0
                  ? Object.values(analogSignals[0])[6]
                  : 0,
              maxTime:
                analogSignals !== undefined && analogSignals.length > 0
                  ? Object.values(analogSignals[analogSignals.length - 1])[6]
                  : 0,
            }}
            presentZoomValues={{
              startPercent: presentZoomValues.startPercent,
              endPercent: presentZoomValues.endPercent,
            }}
            onZoomChange={handleZoomChange}
            tooltipStatus={tooltipStatus}
          />
        </Stack>
      </Grid>

      {sidebarStatus && (
        <Grid item xs={3} sx={{ bgcolor: "" }}>
          <CursorValues
            axisClick={{
              dataIndex: primaryCursor.cursor,
              axisValue: primaryCursor.time,
              timestamp: primaryCursor.timestamp,
              secondaryIndex: secondaryCursor.cursor,
              secondaryValue: secondaryCursor.time,
              secondaryTimestamp: secondaryCursor.timestamp,
            }}
            tableValues={tableValues}
            tooltipStatus={tooltipStatus}
            onCursorMove={handleCursorMove}
            selectedFile={selectedFile}
            projectId={projectId}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ChartComponent;
