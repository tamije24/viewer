import { useState } from "react";

// MUI COMPONENTS
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GridRowSelectionModel } from "@mui/x-data-grid-pro";

// Our components
import ChartBody from "./ChartBody";
import ChartFooter from "./ChartFooter";
import ChartHeader from "./ChartHeader";
import CursorValues from "./CursorValues";

// Our Services
import { AnalogChannel } from "../services/analog-channel-service";
//import { Phasor } from "../services/phasor-service";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

interface Props {
  stationName: string;
  plotName: string;
  selectedIndex: number;
  digitalChannelCount: number[];
  timeValues_original: number[];
  timeStamps_original: string[];
  analog_Values_original: number[][];
  analogSignalNames: string[];
  digital_Values_original: number[][];
  digitalSignalNames: string[];
  dftPhasors: number[][];
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
  sampling_frequency: number;
  pointCount: number;
  sidebarStatus: boolean;
  tooltipStatus: boolean;
  selectedFile: number[];
  projectId: number;
  rowSelectionModel: GridRowSelectionModel;
  digitalRowSelectionModel: GridRowSelectionModel;
  onRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
  onDigitalRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
}

let tableValues: {
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

let tableValuesDigital: {
  id: string;
  channel: string;
  status: number;
}[] = [];

const ChartComponent = ({
  stationName,
  plotName,
  selectedIndex,
  digitalChannelCount,
  timeValues_original,
  timeStamps_original,
  analog_Values_original,
  analogSignalNames,
  digital_Values_original,
  digitalSignalNames,
  dftPhasors,
  error,
  isAnLoading,
  isDigLoading,
  presentZoomValues,
  changePresentZoomLimit,
  cursorValues,
  onAxisClick,
  analogChannelInfo,
  sampling_frequency,
  pointCount,
  sidebarStatus,
  tooltipStatus,
  selectedFile,
  projectId,
  rowSelectionModel,
  digitalRowSelectionModel,
  onRowSelectionModelChange,
  onDigitalRowSelectionModelChange,
}: Props) => {
  // STATE VARIABLES
  const [sliderValue, setSliderValue] = useState(70);
  const [markerStatus, setMarkerStatus] = useState(false);

  const [usedIndex, setUsedIndex] = useState(-2);

  const [presentMaxisYZoomValues, setPresentMaxisYZoomValues] = useState<
    {
      start: number;
      end: number;
    }[]
  >([]);

  const [presentSaxisYZoomValues, setPresentSaxisYZoomValues] = useState<
    {
      start: number;
      end: number;
    }[]
  >([
    { start: 0, end: 100 },
    { start: 0, end: 100 },
  ]);

  const [selectedSinglePlot, SetSelectedSinglePlot] = useState(0);
  const [selectedMultipleAxisPlot, SetSelectedMultipleAxisPlot] = useState(0);

  // const [tableValues, setTableValues] = useState<
  //   {
  //     id: string;
  //     channel: string;
  //     unit: string;
  //     inst: number;
  //     phasor_mag: number;
  //     phasor_ang: number;
  //     true_rms: number;
  //     pos_peak: number;
  //     neg_peak: number;
  //   }[]
  // >([]);
  // const [tableValuesDigital, setTableValuesDigital] = useState<
  //   {
  //     id: string;
  //     channel: string;
  //     status: number;
  //   }[]
  // >([]);

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
    plotName === "SingleAxis" || plotName === "MergeSingleView"
      ? "Single Axis"
      : "Multiple Axis";

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

  // If data not loaded yet, display loading message
  if (
    isAnLoading ||
    analog_Values_original === undefined ||
    analog_Values_original.length === 0 ||
    isDigLoading ||
    digital_Values_original === undefined
  )
    return (
      <Box sx={{ display: "flex-box", mt: 30, ml: 10, mb: 2 }}>
        <Typography variant="overline" component="div" color="forestgreen">
          Data loading ... please wait.
        </Typography>
      </Box>
    );

  // If no error proceed with reading data ....

  // EVENT HANDLERS
  // RESET button in the Chart header
  const handleZoomOutClick = () => {
    let minTime = 0;
    let maxTime = 0;
    if (timeValues_original !== undefined) {
      let L = timeValues_original.length;
      minTime = timeValues_original[0];
      maxTime = timeValues_original[L - 1];
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
    if (timeValues_original !== undefined) {
      let L = timeValues_original.length;
      let maxTime = timeValues_original[L - 1];
      minTime = timeValues_original[0];
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
    if (timeValues_original !== undefined) {
      let L = timeValues_original.length;
      let maxTime = timeValues_original[L - 1];
      minTime = timeValues_original[0];
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

  // Single-axis plot selector
  const handleSinglePlotSelected = (plotNumber: number) => {
    SetSelectedSinglePlot(plotNumber);
  };

  // Multiple-axis plot selector
  const handleMultipleAxisPlotSelected = (plotNumber: number) => {
    SetSelectedMultipleAxisPlot(plotNumber);
  };

  // Y-Axis Zoom handler
  const handleYZoomClick = (zoomType: number) => {
    plotName === "SingleAxis"
      ? handleSAxisYZoomClick(zoomType)
      : handleMAxisYZoomClick(zoomType);
  };

  const handleSAxisYZoomClick = (zoomType: number) => {
    // Check which signal is selected
    let index = 0;
    if (selectedSinglePlot === 1) index = 0;
    else if (selectedSinglePlot === 2) index = 1;
    else return;

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

  const handleMAxisYZoomClick = (zoomType: number) => {
    // Check which signal is selected
    let index = 0;
    if (selectedMultipleAxisPlot > 0) index = selectedMultipleAxisPlot - 1;
    else return;

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

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number);
  };

  // OTHER FUNCTIONS
  const reduceAllArrays = (initialLoading: boolean) => {
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
    for (let i = 0; i < analog_Values_original.length; i++) {
      temp.push(reduceValues(analog_Values_original[i], tempIndexes));
    }

    // analog signals - plot window
    let temp_window: number[][] = [];
    for (let i = 0; i < temp.length; i++) {
      temp_window.push(temp[i].slice(startIndex, endIndex));
    }
    setAnalogValues_window(temp_window);

    // set initial zoom values for multiple axis plot

    let tempZoom = [];
    for (let i = 0; i < temp_window.length; i++) {
      tempZoom.push({ start: 0, end: 100 });
    }
    setPresentMaxisYZoomValues(tempZoom);

    // digital signals filtered - full array
    temp = [];
    for (let i = 0; i < digital_Values_original.length; i++) {
      //  console.log(i);
      temp.push(reduceValues(digital_Values_original[i], tempIndexes));
      //  console.log(i);
    }

    // digital signals  - plot window
    temp_window = [];
    for (let i = 0; i < temp.length; i++) {
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

    if (!initialLoading) {
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
    }
  };

  const reduceValues = (values: any[], requiredIndexes: number[]) => {
    let returnValues: any[] = [];

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

    // ANALOG TABLE VALUES
    tableValues = [];

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

    let ind: { start: number; end: number } = {
      start: secondaryIndex,
      end: dataIndex,
    };

    let channelCount = analog_Values_original.length;
    let sample_values = [];
    let a_sig = [];

    if (
      analog_Values_original !== undefined &&
      analog_Values_original.length > 0
    ) {
      for (let i = 0; i < channelCount; i++) {
        sample_values.push(analog_Values_original[i][dataIndex]);
        a_sig.push(analog_Values_original[i].slice(ind.start, ind.end));
      }
    } else {
      sample_values = new Array(channelCount).fill(0);
      a_sig = new Array(channelCount).fill(0);
    }

    let phasorCount = dftPhasors.length;
    let phasor_values = [];
    if (dftPhasors !== undefined && dftPhasors.length > 0) {
      for (let i = 0; i < phasorCount; i++) {
        phasor_values.push(dftPhasors[i][dataIndex]);
      }
    } else {
      phasor_values = new Array(phasorCount).fill(0);
    }

    // indexes for rms
    let N = Math.round(sampling_frequency / 50);
    let end_rms = dataIndex;
    let start_rms = dataIndex > N ? dataIndex - N + 1 : 0;

    const a_sig_rms = [];
    for (let i = 0; i < analog_Values_original.length; i++)
      a_sig_rms.push(analog_Values_original[i].slice(start_rms, end_rms));

    let id_temp = ["IA", "IB", "IC", "IN", "VA", "VB", "VC"];
    let no_of_stations = names.length / id_temp.length;
    let id = [];

    if (selectedIndex === -1) {
      for (let i = 1; i <= no_of_stations; i++) {
        for (let j = 0; j < id_temp.length; j++) {
          id.push(id_temp[j] + "-" + i);
        }
      }
    } else {
      let n = selectedIndex + 1;
      for (let j = 0; j < id_temp.length; j++) {
        id.push(id_temp[j] + "-" + n);
      }
    }
    for (let i = 0; i < names.length; i++) {
      let label = names[i];
      let unit = units[i];
      let positivePeak =
        a_sig.length > 0
          ? a_sig[i].length === 0
            ? a_sig[i][0]
            : Math.max(...a_sig[i])
          : 0;
      let negativePeak =
        a_sig.length > 0
          ? a_sig[i].length === 0
            ? a_sig[i][0]
            : Math.min(...a_sig[i])
          : 0;

      let rowValue = {
        id: id[i],
        channel: label,
        unit: unit,
        inst: sample_values[i],
        phasor_mag: phasor_values[2 * i],
        phasor_ang: phasor_values[2 * i + 1],
        true_rms: calculateRMS(a_sig_rms[i]),
        pos_peak: positivePeak,
        neg_peak: negativePeak,
      };
      tableValues.push(rowValue);
    }
    // DIGITAL TABLE VALUES
    // Set table values to be displayed

    tableValuesDigital = [];

    // Set table values to be displayed
    let namesDigital: string[] = [];
    if (digitalSignalNames !== undefined) {
      namesDigital = [...digitalSignalNames];
    } else {
      return;
    }

    let digital_sample_values =
      digital_Values_original !== undefined &&
      digital_Values_original.length > 0
        ? digital_Values_original.slice()[dataIndex]
        : new Array(digital_Values_original.length).fill(0);

    id = [];
    if (selectedIndex === -1) {
      for (let i = 1; i <= no_of_stations; i++) {
        for (let j = 1; j <= digitalChannelCount[i - 1]; j++) {
          id.push("D" + j + "-" + i);
        }
      }
    } else {
      let n = selectedIndex + 1;
      for (let j = 1; j <= namesDigital.length; j++) {
        id.push("D" + j + "-" + n);
      }
    }

    for (let i = 0; i < namesDigital.length; i++) {
      let label = namesDigital[i];
      let rowValueDigital = {
        id: id[i],
        channel: label,
        status: digital_sample_values ? Number(digital_sample_values[i]) : 0,
      };
      tableValuesDigital.push(rowValueDigital);
    }
  };

  const calculateRMS = (values: number[]) => {
    let N = values.length;

    // squaring values
    let rmsValue = 0;
    for (let i = 0; i < N; i++) {
      rmsValue = rmsValue + values[i] * values[i];
    }

    // root and mean
    if (N > 0) rmsValue = Math.sqrt(rmsValue / N);
    else rmsValue = 0;

    return rmsValue;
  };

  if (
    !isAnLoading &&
    analog_Values_original !== undefined &&
    analog_Values_original.length > 0 &&
    !isDigLoading &&
    digital_Values_original !== undefined
  ) {
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
      setUsedIndex(selectedIndex);
      fillSideTable();
    }
  }

  if (analogSignalNames !== undefined) {
    if (usedIndex === undefined) {
      setUsedIndex(selectedIndex);
      fillSideTable();
    } else if (selectedIndex !== usedIndex) {
      setUsedIndex(selectedIndex);
      fillSideTable();
    }
  }

  // calculate reduced values after initial loading
  if (
    analog_Values_original !== undefined &&
    analog_Values_original.length > 0 &&
    digital_Values_original !== undefined &&
    originalIndexes.length === 0
  ) {
    reduceAllArrays(true);
    setPrevZoomValue([
      presentZoomValues.startPercent,
      presentZoomValues.endPercent,
    ]);
  }

  // recalculate when station changes
  if (prevAnalogSignalNames != analogSignalNames) {
    setPrevAnalogSignalNames(analogSignalNames);
    reduceAllArrays(true);
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
    reduceAllArrays(false);
  }

  // recalculate when display point count changes
  if (prevPointCount !== pointCount) {
    setPrevPointCount(pointCount);
    reduceAllArrays(false);
  }

  return (
    <Grid container sx={{ mt: 7.5, ml: 0.5, mb: 0.5 }}>
      {sidebarStatus && (
        <Grid item xs={12} sx={{ height: 15 }}>
          <MySlider
            size="small"
            aria-label="Small"
            valueLabelDisplay="off"
            value={sliderValue}
            onChange={handleSliderChange}
            sx={{ height: 0, pt: 0, mt: 0 }}
            slots={{ thumb: AirbnbThumbComponent }}
          />
        </Grid>
      )}
      <Grid item xs={sidebarStatus ? 12 * (sliderValue / 100) : 12}>
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
                timeValues_original !== undefined &&
                timeValues_original.length > 0
                  ? timeValues_original[0]
                  : 0,
              maxTime:
                timeValues_original !== undefined &&
                timeValues_original.length > 0
                  ? timeValues_original[timeValues_original.length - 1]
                  : 0,
            }}
            tooltipStatus={tooltipStatus}
          />

          <ChartBody
            plotName={plotName}
            selectedIndex={selectedIndex}
            digitalChannelCount={digitalChannelCount}
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
            onSinglePlotSelected={handleSinglePlotSelected}
            onMultipleAxisPlotSelected={handleMultipleAxisPlotSelected}
            rowSelectionModel={rowSelectionModel}
            digitalRowSelectionModel={digitalRowSelectionModel}
          />
          <ChartFooter
            timeRange={{
              minTime:
                timeValues_original !== undefined &&
                timeValues_original.length > 0
                  ? timeValues_original[0]
                  : 0,
              maxTime:
                timeValues_original !== undefined &&
                timeValues_original.length > 0
                  ? timeValues_original[timeValues_original.length - 1]
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
        <Grid
          item
          xs={(12 * (100 - sliderValue)) / 100}
          sx={{ borderLeft: 2, borderColor: "lightgray", pl: 0 }}
        >
          <CursorValues
            selectedIndex={selectedIndex}
            digitalChannelCount={digitalChannelCount}
            axisClick={{
              dataIndex: primaryCursor.cursor,
              axisValue: primaryCursor.time,
              timestamp: primaryCursor.timestamp,
              secondaryIndex: secondaryCursor.cursor,
              secondaryValue: secondaryCursor.time,
              secondaryTimestamp: secondaryCursor.timestamp,
            }}
            tableValues={tableValues}
            tableValuesDigital={tableValuesDigital}
            tooltipStatus={tooltipStatus}
            onCursorMove={handleCursorMove}
            selectedFile={selectedFile}
            projectId={projectId}
            rowSelectionModel={rowSelectionModel}
            digitalRowSelectionModel={digitalRowSelectionModel}
            onRowSelectionModelChange={onRowSelectionModelChange}
            onDigitalRowSelectionModelChange={onDigitalRowSelectionModelChange}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ChartComponent;

const myBoxShadow =
  "0 3px 1px rgba(0,0,0,0.9),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)";

const MySlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === "light" ? "#444444" : "#999999",
  height: 0,
  padding: "1px 0px 20px 2px",
  "& .MuiSlider-thumb": {
    height: 10,
    width: 45,
    backgroundColor: "#fff",
    border: "1px solid #fff",
    // ...theme.applyStyles("dark", {
    //   backgroundColor: "honeydew",
    //   border: "1px solid darkslategrey",
    // }),

    boxShadow: "0 1px 1px 0px rgba(0, 0, 0, 0.4)",
    "&:focus, &:hover, &.Mui-active": {
      boxShadow: "0px 0px 3px 1px rgba(0, 0, 0, 0.1)",
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        boxShadow: myBoxShadow,
      },
    },
    "&:before": {
      boxShadow:
        "0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 2,
      backgroundColor: "gray",
      marginLeft: 2,
      marginRight: 2,
    },
  },
}));

interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> {}

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <Tooltip title="Hold and drag to adjust sidepanel width" placement="top">
      <SliderThumb {...other}>
        {children}
        <Typography
          sx={{
            color: "gray",
            fontSize: 16,
            pr: 0.2,
          }}
        >
          &gt;
        </Typography>
        <span className="airbnb-bar" />
        <Typography
          sx={{
            color: "gray",
            fontSize: 16,
            pl: 0.2,
          }}
        >
          &lt;
        </Typography>
      </SliderThumb>
    </Tooltip>
  );
}
