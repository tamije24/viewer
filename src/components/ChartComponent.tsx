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
}: Props) => {
  // STATE VARIABLES
  const [toolTipStatus, setToolTipStatus] = useState(false);

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

  // OTHER VARIABLES
  const plotSubtitle =
    plotName === "SingleAxis" ? "Single Axis View" : "Multiple Axis View";

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

  // TOOL TIP in Chart header
  const handleTooltipChange = (tTStatus: boolean) => {
    setToolTipStatus(tTStatus);
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

    secondaryCursor = {
      cursor: secondaryIndex,
      cursorReduced: secondaryIndexReduced,
      time: secondaryValue,
      timestamp: secondaryTimestamp,
    };

    // console.log("chart component: ", dataIndex, dataIndexReduced);

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
    }

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

  // HELPER FUNCTIONS
  const arrayColumn = (arr: number[][], n: number) => arr.map((x) => x[n]);
  const strArrayColumn = (arr: string[][], n: number) => arr.map((x) => x[n]);

  // OTHER FUNCTIONS
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
      analogSignals !== undefined
        ? Object.values(analogSignals[dataIndex])
        : new Array(7).fill(0);

    let phasor_values =
      dftPhasors !== undefined
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
        a_sig.length > 0 ? Math.max(...arrayColumn(a_sig, i + 1)) : 0;
      let negativePeak =
        a_sig.length > 0 ? Math.min(...arrayColumn(a_sig, i + 1)) : 0;

      let rowValue = {
        id: id[i],
        channel: label,
        unit: unit,
        inst: sample_values[i + 1],
        phasor_mag: phasor_values[2 * i],
        phasor_ang: phasor_values[2 * i + 1],
        true_rms: calculateRMS([...arrayColumn(a_sig_rms, i + 1)]),
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
    timeValues_original = arrayColumn(analogSignals_split, 0);
    timeStamps_original = strArrayColumn(analogSignals_split, 7);
    analog_Values_original = [];
    for (let i = 0; i < 6; i++)
      analog_Values_original.push(arrayColumn(analogSignals_split, i + 1));

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
      value[1] = factor * value[1] + 0.5;
      value[2] = factor * value[2] + 1.5;
      value[3] = factor * value[3] + 2.5;
      value[4] = factor * value[4] + 3.5;
      digitalSignals_split.push(value);
    }

    digital_Values_original = [];
    for (let i = 0; i < 4; i++)
      digital_Values_original.push(arrayColumn(digitalSignals_split, i + 1));
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
            toolTipStatus={toolTipStatus}
            onToolTipStatusChange={handleTooltipChange}
            onYZoomClick={handleYZoomClick}
            timeRange={{
              minTime:
                analogSignals !== undefined
                  ? Object.values(analogSignals[0])[0]
                  : 0,
              maxTime:
                analogSignals !== undefined
                  ? Object.values(analogSignals[analogSignals.length - 1])[0]
                  : 0,
            }}
          />
          <ChartBody
            plotName={plotName}
            analogSignalNames={analogSignalNames}
            digitalSignalNames={digitalSignalNames}
            analog_Values_original={analog_Values_original}
            digital_Values_original={digital_Values_original}
            timeValues_original={timeValues_original}
            timeStamps_original={timeStamps_original}
            presentZoomValues={presentZoomValues}
            toolTipStatus={toolTipStatus}
            cursorValues={cursorValues}
            onAxisClick={handleAxisClick}
            pointCount={pointCount}
            presentMaxisYZoomValues={presentMaxisYZoomValues}
            presentSaxisYZoomValues={presentSaxisYZoomValues}
          />
          <ChartFooter
            timeRange={{
              minTime:
                analogSignals !== undefined
                  ? Object.values(analogSignals[0])[0]
                  : 0,
              maxTime:
                analogSignals !== undefined
                  ? Object.values(analogSignals[analogSignals.length - 1])[0]
                  : 0,
            }}
            presentZoomValues={{
              startPercent: presentZoomValues.startPercent,
              endPercent: presentZoomValues.endPercent,
            }}
            onZoomChange={handleZoomChange}
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
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ChartComponent;
