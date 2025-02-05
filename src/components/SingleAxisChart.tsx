import { useState } from "react";
import useId from "@mui/utils/useId";

import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import {
  AreaPlot,
  //  axisClasses,
  ChartsAxisHighlight,
  ChartsClipPath,
  ChartsGrid,
  //  ChartsLegend,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  ZoomData,
} from "@mui/x-charts-pro";
import { ResponsiveChartContainerPro } from "@mui/x-charts-pro/ResponsiveChartContainerPro";
import { HighlightScope } from "@mui/x-charts/context/HighlightedProvider";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";
import { LineSeriesType } from "@mui/x-charts/models/seriesType";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import CardActionArea from "@mui/material/CardActionArea";

interface Props {
  digitalChannelCount: number[];
  analogSignalNames: string[];
  digitalSignalNames: string[];
  analogValues_window: number[][];
  digitalValues_window: number[][];
  stationCount: number;
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
    reducedIndex: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    reducedSecondaryIndex: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => void;
  presentSaxisYZoomValues: {
    start: number;
    end: number;
  }[];
  onSinglePlotSelected: (plotNumber: number) => void;
  selectedWaveform: boolean[];
  selectedDigitalWaveform: boolean[];
}

const SingleAxisChart = ({
  digitalChannelCount,
  analogSignalNames,
  digitalSignalNames,
  analogValues_window,
  digitalValues_window,
  stationCount,
  timeValues,
  timeStamps,
  originalIndexes,
  tickInterval,
  markerStatus,
  cursorValues,
  onAxisClick,
  presentSaxisYZoomValues,
  onSinglePlotSelected,
  selectedWaveform,
  selectedDigitalWaveform,
}: Props) => {
  // STATE VARIABLES
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errMessage, setErrorMessage] = useState("");

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

  const [selectedPlot, setSelectedPlot] = useState(0);

  //OTHER VARIABLES

  let zoom: ZoomData[] = [
    {
      axisId: "time-axis",
      start: 0,
      end: 100,
    },
    {
      axisId: "currentAxis",
      start: presentSaxisYZoomValues[0].start,
      end: presentSaxisYZoomValues[0].end,
    },
    {
      axisId: "voltageAxis",
      start: presentSaxisYZoomValues[1].start,
      end: presentSaxisYZoomValues[1].end,
    },
  ];

  let current_series: LineSeriesType[] = [];
  let voltage_series: LineSeriesType[] = [];
  let digital_series: LineSeriesType[] = [];

  let color_light = ["crimson", "goldenrod", "deepskyblue", "black"];
  //let color_digital = ["saddlebrown", "coral", "plum", "blue"];

  const id = useId();
  const clipPathId_1 = `${id}-clip-path-1`;
  const clipPathId_2 = `${id}-clip-path-2`;
  const clipPathId_3 = `${id}-clip-path-3`;

  let zeroPresent =
    timeValues.findIndex((element) => element === 0) === -1 ? false : true;
  let primaryPresent =
    timeValues.findIndex(
      (element) => element === timeValues[primaryCursor.cursorReduced]
    ) === -1
      ? false
      : true;
  let secondaryPresent =
    timeValues.findIndex(
      (element) => element === timeValues[secondaryCursor.cursorReduced]
    ) === -1
      ? false
      : true;

  // EVENT HANDLERS
  const handleAxisClick = (
    event: MouseEvent,
    dataIndex: number,
    axisValue: number
  ) => {
    if (event.shiftKey) {
      if (originalIndexes[dataIndex] >= primaryCursor.cursor) {
        setErrorMessage(
          "Secondary cursor position must be before primary cursor position"
        );
        setOpenSnackbar(true);
        return;
      }

      setSecondaryCursor({
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });

      onAxisClick(
        primaryCursor.cursor,
        primaryCursor.cursorReduced,
        primaryCursor.time,
        primaryCursor.timestamp,
        originalIndexes[dataIndex],
        dataIndex,
        axisValue,
        timeStamps[dataIndex]
      );
    } else {
      if (originalIndexes[dataIndex] <= secondaryCursor.cursor) {
        setErrorMessage(
          "Primary cursor position must be after secondary cursor position"
        );
        setOpenSnackbar(true);
        return;
      }

      setPrimaryCursor({
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });

      primaryPresent =
        timeValues.findIndex((element) => element === timeValues[dataIndex]) ===
        -1
          ? false
          : true;

      onAxisClick(
        originalIndexes[dataIndex],
        dataIndex,
        axisValue,
        timeStamps[dataIndex],
        secondaryCursor.cursor,
        secondaryCursor.cursorReduced,
        secondaryCursor.time,
        secondaryCursor.timestamp
      );
    }
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorMessage("");
    setOpenSnackbar(false);
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  current_series = [];
  voltage_series = [];
  digital_series = [];
  // const baseline: number[] = [];

  // for (let i = 0; i < selectedDigitalWaveform.length; i++) {
  //   baseline.push(i + 0.3);
  // }

  // console.log(baseline);

  let digital_offset = 0;
  let digCount = selectedDigitalWaveform.filter((x) => x === true).length;
  let baseline = digCount * 0.3;

  for (let station = stationCount - 1; station >= 0; station--) {
    let offset = station * 7;
    for (let i = 0; i < 4; i++) {
      if (selectedWaveform[i + offset]) {
        let label = analogSignalNames[i + offset];
        let a: LineSeriesType = {
          type: "line",
          label: label,
          data: analogValues_window[i + offset],
          yAxisId: "currentAxis",
          showMark: false,
          color: color_light[i],
          highlightScope: {
            highlighted: "series",
            faded: "global",
          } as HighlightScope,
        };
        current_series.push(a);
      }
    }

    for (let i = 4; i < 7; i++) {
      if (selectedWaveform[i + offset]) {
        let label = analogSignalNames[i + offset];
        let a: LineSeriesType = {
          type: "line",
          label: label,
          data: analogValues_window[i + offset],
          yAxisId: "voltageAxis",
          showMark: false,
          color: color_light[i - 4],
          highlightScope: {
            highlighted: "series",
            faded: "global",
          } as HighlightScope,
        };
        voltage_series.push(a);
      }
    }

    let digital_length = 0;
    if (stationCount === 1) digital_length = digitalSignalNames.length;
    else digital_length = digitalChannelCount[station];

    for (let i = digital_length - 1; i >= 0; i--) {
      //for (let i = 0; i < digitalChannelCount[station]; i++) {
      if (selectedDigitalWaveform[i - digital_offset]) {
        baseline = digCount - 0.3;
        digCount = digCount - 1;

        let temp = [];
        for (
          let j = digitalValues_window[i - digital_offset].length - 1;
          j >= 0;
          j--
        ) {
          temp[j] =
            baseline + digitalValues_window[i - digital_offset][j] * 0.3;
        }

        let label = digitalSignalNames[i - digital_offset];
        let d: LineSeriesType = {
          type: "line",
          yAxisId: "status",
          label: label,
          data: temp,
          showMark: false,
          area: true,
          //  color: color_digital[i],
          baseline: baseline,
          highlightScope: {
            highlighted: "series",
            faded: "global",
          } as HighlightScope,
          valueFormatter: (_v) => {
            return "";
          },
        };
        digital_series.push(d);
      }
    }
    digital_offset = digital_offset - digital_length;
  }

  if (
    primaryCursor.cursorReduced != cursorValues.primaryReduced ||
    primaryCursor.cursor != cursorValues.primary
  )
    setPrimaryCursor({
      cursor: cursorValues.primary,
      cursorReduced: cursorValues.primaryReduced,
      time: cursorValues.primaryTime,
      timestamp: cursorValues.primaryTimestamp,
    });

  if (
    secondaryCursor.cursorReduced != cursorValues.secondaryReduced ||
    secondaryCursor.cursor != cursorValues.secondary
  )
    setSecondaryCursor({
      cursor: cursorValues.secondary,
      cursorReduced: cursorValues.secondaryReduced,
      time: cursorValues.secondaryTime,
      timestamp: cursorValues.secondaryTimestamp,
    });

  const timeFormatter = (
    timevalue: number,
    context: AxisValueFormatterContext
  ) => {
    // console.log(timeValues[timeValues.length - 1] - timeValues[0]);
    let timeInd = timeValues.findIndex((element) => element === timevalue);
    let tickLabel = "";
    if (context.location === "tick") {
      tickLabel =
        timeValues[timeValues.length - 1] - timeValues[0] >= 0.016
          ? `${(Math.round(timevalue * 1000) / 1000).toFixed(3)}`
          : `${(Math.round(timevalue * 1000000) / 1000000).toFixed(6)}`;
    } else {
      tickLabel = timeStamps[timeInd];
    }
    return tickLabel;
  };

  const timeStampFormatter = (timevalue: number) => {
    let timeInd = timeValues.findIndex((element) => element === timevalue);
    return `${timeStamps[timeInd]}`;
  };

  const xAxisCommon = {
    id: "time-axis",
    scaleType: "point",
    zoom: { filterMode: "discard" },
    valueFormatter: timeFormatter,
    labelStyle: {
      fontSize: 11,
    },
    tickLabelStyle: {
      angle: 0,
      textAnchor: "middle",
      fontSize: 10,
    },
  } as const;

  const leftMargin = 0;
  const rightMargin = 30;

  let currentPlotHeight = `0px`;
  let voltagePlotHeight = `0px`;
  let statusPlotHeight = `0px`;

  // Calculate plot heights
  if (
    current_series.length === 0 &&
    voltage_series.length === 0 &&
    digital_series.length === 0
  ) {
    return (
      <Grid
        container
        rowSpacing={0}
        columnSpacing={0}
        padding="0"
        margin="0"
        height={`calc(100vh - 290px)`}
        sx={{ bgcolor: "" }}
      >
        No Waveform selected
      </Grid>
    );
  } else if (
    current_series.length === 0 &&
    voltage_series.length === 0 &&
    digital_series.length > 0
  ) {
    statusPlotHeight = `calc((100vh - 330px)*1)`;
  } else if (
    current_series.length === 0 &&
    voltage_series.length > 0 &&
    digital_series.length === 0
  ) {
    voltagePlotHeight = `calc((100vh - 330px)*1)`;
  } else if (
    current_series.length === 0 &&
    voltage_series.length > 0 &&
    digital_series.length > 0
  ) {
    voltagePlotHeight = `calc((100vh - 330px)*0.5)`;
    statusPlotHeight = `calc((100vh - 330px)*0.5)`;
  } else if (
    current_series.length > 0 &&
    voltage_series.length === 0 &&
    digital_series.length === 0
  ) {
    currentPlotHeight = `calc((100vh - 330px)*1)`;
  } else if (
    current_series.length > 0 &&
    voltage_series.length === 0 &&
    digital_series.length > 0
  ) {
    currentPlotHeight = `calc((100vh - 330px)*0.5)`;
    statusPlotHeight = `calc((100vh - 330px)*0.5)`;
  } else if (
    current_series.length > 0 &&
    voltage_series.length > 0 &&
    digital_series.length === 0
  ) {
    currentPlotHeight = `calc((100vh - 330px)*0.5)`;
    voltagePlotHeight = `calc((100vh - 330px)*0.5)`;
  } else if (
    current_series.length > 0 &&
    voltage_series.length > 0 &&
    digital_series.length > 0
  ) {
    currentPlotHeight = `calc((100vh - 330px)*0.33)`;
    voltagePlotHeight = `calc((100vh - 330px)*0.33)`;
    statusPlotHeight = `calc((100vh - 330px)*0.33)`;
  }

  let plotCurrents = currentPlotHeight === `0px` ? false : true;
  let plotVoltages = voltagePlotHeight === `0px` ? false : true;
  let plotStatus = statusPlotHeight === `0px` ? false : true;

  const selectedColor = "#C2EBFF";

  return (
    <>
      <Grid
        container
        rowSpacing={0}
        columnSpacing={0}
        padding="0"
        margin="0"
        height={`calc(100vh - 290px)`}
        sx={{ bgcolor: "" }}
      >
        {plotCurrents && (
          <>
            <Grid item xs={0.2}>
              <CardActionArea
                onClick={() => {
                  if (selectedPlot == 1) {
                    setSelectedPlot(0);
                    onSinglePlotSelected(0);
                  } else {
                    setSelectedPlot(1);
                    onSinglePlotSelected(1);
                  }
                }}
                sx={{
                  height: "100%",
                  width: "100%",
                  alignContent: "center",
                  bgcolor: selectedPlot == 1 ? selectedColor : "",
                }}
              />
            </Grid>
            <Grid item xs={11.8} sx={{ height: currentPlotHeight }}>
              <ResponsiveChartContainerPro
                key={"current-signal"}
                xAxis={[
                  {
                    ...xAxisCommon,
                    data: timeValues,
                  },
                ]}
                yAxis={[{ id: "currentAxis" }]}
                series={current_series}
                zoom={zoom}
                margin={{
                  left: leftMargin,
                  right: rightMargin,
                  top: 30,
                  bottom: 0,
                }}
                sx={{
                  "& .MuiLineElement-root": {
                    strokeWidth: 1.5,
                  },
                  width: "100%",
                  bgcolor: selectedPlot == 1 ? "azure" : "",
                }}
              >
                <ChartsTooltip trigger={markerStatus ? "axis" : "none"} />
                <ChartsAxisHighlight />
                <ChartsGrid horizontal />
                <ChartsOnAxisClickHandler
                  onAxisClick={(event, data) => {
                    handleAxisClick(
                      event,
                      data ? data.dataIndex : 0,
                      data ? Number(data.axisValue ? data.axisValue : 0) : 0
                    );
                  }}
                />
                <g clipPath={`url(#${clipPathId_1})`}>
                  <ChartsReferenceLine
                    axisId={"currentAxis"}
                    y={0}
                    lineStyle={{
                      strokeDasharray: "0",
                      strokeWidth: 0.5,
                      stroke: "black",
                    }}
                  />
                  <LinePlot
                  //skipAnimation
                  />
                  {zeroPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={0}
                      lineStyle={{
                        strokeDasharray: "5 1",
                        strokeWidth: 1.0,
                        stroke: "secondary",
                      }}
                    />
                  )}
                  {primaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[primaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "10 5",
                        strokeWidth: 1.5,
                        stroke: "darkorchid",
                      }}
                    />
                  )}

                  {secondaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[secondaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "3 3",
                        strokeWidth: 2,
                        stroke: "forestgreen",
                      }}
                    />
                  )}
                </g>

                <ChartsYAxis
                  disableTicks
                  position="left"
                  axisId="currentAxis"
                  tickInterval={[0]}
                />

                <ChartsYAxis
                  disableTicks
                  label="CURRENTS"
                  labelStyle={{
                    fontSize: 10,
                    angle: -90,
                    // transform: "translateX(-5px)",
                  }}
                  position="right"
                  axisId="currentAxis"
                  tickInterval={[]}
                />

                <ChartsClipPath id={clipPathId_1} />
                <ChartsXAxis
                  disableTicks
                  disableLine
                  position="top"
                  axisId="time-axis"
                  tickInterval={[0]}
                  valueFormatter={timeStampFormatter}
                  tickLabelStyle={{ fontSize: "10" }}
                />
              </ResponsiveChartContainerPro>
            </Grid>
          </>
        )}

        {plotVoltages && (
          <>
            <Grid item xs={0.2}>
              <CardActionArea
                onClick={() => {
                  if (selectedPlot == 2) {
                    setSelectedPlot(0);
                    onSinglePlotSelected(0);
                  } else {
                    setSelectedPlot(2);
                    onSinglePlotSelected(2);
                  }
                }}
                sx={{
                  height: "100%",
                  width: "100%",
                  alignContent: "center",
                  bgcolor: selectedPlot == 2 ? selectedColor : "",
                }}
              />
            </Grid>
            <Grid item xs={11.8} sx={{ height: voltagePlotHeight }}>
              <ResponsiveChartContainerPro
                key={"voltage-signal"}
                xAxis={[
                  {
                    ...xAxisCommon,
                    data: timeValues,
                  },
                ]}
                yAxis={[{ id: "voltageAxis" }]}
                series={voltage_series}
                zoom={zoom}
                margin={{
                  left: leftMargin,
                  right: rightMargin,
                  top: 0,
                  bottom: 0,
                }}
                sx={{
                  "& .MuiLineElement-root": {
                    strokeWidth: 1.5,
                  },
                  borderTop: 0.3,
                  bgcolor: selectedPlot == 2 ? "azure" : "",
                }}
              >
                <ChartsTooltip trigger={markerStatus ? "axis" : "none"} />
                <ChartsAxisHighlight />
                <ChartsGrid horizontal />
                <ChartsOnAxisClickHandler
                  onAxisClick={(event, data) => {
                    handleAxisClick(
                      event,
                      data ? data.dataIndex : 0,
                      data ? Number(data.axisValue ? data.axisValue : 0) : 0
                    );
                  }}
                />
                <ChartsYAxis
                  disableTicks
                  position="left"
                  axisId="voltageAxis"
                  tickInterval={[0]}
                />
                <ChartsYAxis
                  disableTicks
                  label="VOLTAGE"
                  labelStyle={{
                    fontSize: 10,
                    angle: -90,
                  }}
                  position="right"
                  axisId="voltageAxis"
                  tickInterval={[]}
                />
                <g clipPath={`url(#${clipPathId_2})`}>
                  <ChartsReferenceLine
                    axisId={"voltageAxis"}
                    y={0}
                    lineStyle={{
                      strokeDasharray: "0",
                      strokeWidth: 0.5,
                      stroke: "black",
                    }}
                  />
                  <LinePlot
                  //skipAnimation
                  />
                  {zeroPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={0}
                      lineStyle={{
                        strokeDasharray: "5 1",
                        strokeWidth: 1.0,
                        stroke: "secondary",
                      }}
                    />
                  )}
                  {primaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[primaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "10 5",
                        strokeWidth: 1.5,
                        stroke: "darkorchid",
                      }}
                    />
                  )}

                  {secondaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[secondaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "3 3",
                        strokeWidth: 2,
                        stroke: "forestgreen",
                      }}
                    />
                  )}
                </g>
                <ChartsClipPath id={clipPathId_2} />
              </ResponsiveChartContainerPro>
            </Grid>
          </>
        )}

        {plotStatus && (
          <>
            <Grid item xs={0.2}>
              <div />{" "}
            </Grid>
            <Grid item xs={11.8} sx={{ height: statusPlotHeight }}>
              <ResponsiveChartContainerPro
                key="digital-signals"
                xAxis={[{ ...xAxisCommon, data: timeValues }]}
                yAxis={[{ id: "status" }]}
                series={digital_series}
                zoom={zoom}
                margin={{
                  left: leftMargin,
                  right: rightMargin,
                  top: 0,
                  bottom: 0,
                }}
                sx={{
                  "& .MuiLineElement-root": {
                    strokeWidth: 1.5,
                  },
                  borderTop: 0.3,
                }}
              >
                <ChartsTooltip trigger={markerStatus ? "axis" : "none"} />
                <ChartsOnAxisClickHandler
                  onAxisClick={(event, data) => {
                    handleAxisClick(
                      event,
                      data ? data.dataIndex : 0,
                      data ? Number(data.axisValue ? data.axisValue : 0) : 0
                    );
                  }}
                />
                <ChartsYAxis
                  disableTicks
                  position="left"
                  axisId="status"
                  tickInterval={[]}
                />
                <ChartsYAxis
                  disableTicks
                  label="STATUS"
                  labelStyle={{
                    fontSize: 10,
                    angle: -90,
                  }}
                  position="right"
                  axisId="status"
                  tickInterval={[]}
                />
                <g clipPath={`url(#${clipPathId_3})`}>
                  <AreaPlot
                  //skipAnimation
                  />
                  <LinePlot
                  //skipAnimation
                  />
                  {zeroPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={0}
                      lineStyle={{
                        strokeDasharray: "5 1",
                        strokeWidth: 1.0,
                        stroke: "secondary",
                      }}
                    />
                  )}
                  {primaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[primaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "10 5",
                        strokeWidth: 1.5,
                        stroke: "darkorchid",
                      }}
                    />
                  )}
                  {secondaryPresent && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[secondaryCursor.cursorReduced]}
                      lineStyle={{
                        strokeDasharray: "3 3",
                        strokeWidth: 2,
                        stroke: "forestgreen",
                      }}
                    />
                  )}
                </g>
                <ChartsClipPath id={clipPathId_3} />
                <ChartsAxisHighlight />
                {/* <ChartsLegend
            axisDirection="x"
            position={{ vertical: "bottom", horizontal: "right" }}
            direction="row"
            padding={10}
            slotProps={{
              legend: {
                itemMarkHeight: 5,
                labelStyle: {
                  fontSize: 10,
                },
              },
            }}
          /> */}
              </ResponsiveChartContainerPro>
            </Grid>
          </>
        )}

        <Grid item xs={0.2} sx={{ bgcolor: "" }}></Grid>
        <Grid item xs={11.8} sx={{ height: "40px" }}>
          <ResponsiveChartContainerPro
            xAxis={[
              {
                ...xAxisCommon,
                data: timeValues,
              },
            ]}
            yAxis={[{ id: "y-axis" }]}
            series={[]}
            zoom={zoom}
            margin={{
              left: leftMargin,
              right: rightMargin,
              top: 0,
              bottom: 40,
            }}
          >
            <ChartsXAxis
              axisId="time-axis"
              position="bottom"
              label="Time (seconds)"
              tickInterval={tickInterval}
            />
            <ChartsYAxis
              disableTicks
              position="left"
              axisId="y-axis"
              tickInterval={[]}
            />
            <ChartsYAxis
              disableTicks
              position="right"
              axisId="y-axis"
              tickInterval={[]}
            />
          </ResponsiveChartContainerPro>
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleClose}
        message={errMessage}
        action={action}
      />
    </>
  );
};

export default SingleAxisChart;
