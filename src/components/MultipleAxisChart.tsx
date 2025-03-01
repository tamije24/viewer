import Grid from "@mui/material/Grid";
import {
  ChartsAxisHighlight,
  ChartsClipPath,
  //ChartsGrid,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  HighlightScope,
  LinePlot,
  LineSeriesType,
  ResponsiveChartContainerPro,
  ZoomData,
} from "@mui/x-charts-pro";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";
import { useState } from "react";
import useId from "@mui/utils/useId";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface Props {
  analogSignalNames: string[];
  analogValues_window: number[][];
  //digitalValues_window: number[][];
  stationCount: number;
  timeValues: number[];
  timeStamps: string[];
  originalIndexes: number[];
  // presentZoomValues: {
  //   startPercent: number;
  //   endPercent: number;
  // };
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
  presentMaxisYZoomValues: {
    start: number;
    end: number;
  }[];
  onMultipleAxisPlotSelected: (plotNumber: number) => void;
  selectedWaveform: boolean[];
}

const MultipleAxisChart = ({
  analogSignalNames,
  analogValues_window,
  stationCount,
  timeValues,
  timeStamps,
  originalIndexes,
  tickInterval,
  markerStatus,
  cursorValues,
  onAxisClick,
  presentMaxisYZoomValues,
  onMultipleAxisPlotSelected,
  selectedWaveform,
}: Props) => {
  // STATE VARIABLES
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errMessage, setErrorMessage] = useState("");
  const [selectedPlot, setSelectedPlot] = useState(0);

  // OTHER VARIABLES

  const temp_signals = ["IA", "IB", "IC", "IN", "VA", "VB", "VC"];
  const temp_color = [
    "crimson",
    "goldenrod",
    "deepskyblue",
    "black",
    "crimson",
    "goldenrod",
    "deepskyblue",
  ];

  const signals: string[] = [];
  const yAxisNames: string[] = [];
  const color_light: string[] = [];
  const clipPathIds: string[] = [];
  const zoom: ZoomData[] = [];

  const id = useId();
  for (let i = 1; i <= stationCount; i++) {
    for (let j = 0; j < temp_signals.length; j++) {
      signals.push(temp_signals[j] + "-" + i);
      yAxisNames.push(temp_signals[j] + "-axis-" + i);
      color_light.push(temp_color[j]);
      clipPathIds.push(`${id}-clip-path-${j + 1}-${i}`);
    }
  }
  zoom.push({
    axisId: "time-axis",
    start: 0,
    end: 100,
  });

  for (let i = 0; i < yAxisNames.length; i++) {
    zoom.push({
      axisId: yAxisNames[i],
      start: presentMaxisYZoomValues[i].start,
      end: presentMaxisYZoomValues[i].end,
    });
  }

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

  let series: LineSeriesType[] = [];

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
      secondaryCursor = {
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      };
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
      primaryCursor = {
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      };
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

  series = [];
  for (let i = 0; i < analogSignalNames.length; i++) {
    //   if (selectedWaveform[i]) {
    let label = analogSignalNames[i];
    let a: LineSeriesType = {
      type: "line",
      label: label,
      data: analogValues_window[i],
      yAxisId: yAxisNames[i],
      showMark: false,
      color: color_light[i],
      highlightScope: {
        highlighted: "series",
        faded: "global",
      } as HighlightScope,
    };
    series.push(a);
    //   }
  }

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

  const xAxisCommon = {
    id: "time-axis",
    scaleType: "point",
    zoom: { filterMode: "discard" },
    valueFormatter: timeFormatter,
    //  zoom: { panning: true },
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

  // Calculate plot heights
  let PlotHeight = `calc(100vh - 330px)`;
  const PlotCount = selectedWaveform.filter((i) => i === true).length;

  if (PlotCount === 0) {
    return (
      <Box sx={{ display: "flex-box", mt: 2, ml: 2, mb: 2 }}>
        <Typography variant="overline" component="div" color="forestgreen">
          Please select waveforms to view
        </Typography>
      </Box>
    );
  } else {
    PlotHeight = `calc((100vh - 330px)/${PlotCount})`;
  }
  const selectedColor = "#C2EBFF";

  // console.log(series.length);
  // console.log(selectedWaveform);
  // console.log(yAxisNames);

  return (
    <>
      <Grid
        container
        key={"multchartholder"}
        height={`calc(100vh - 290px)`}
        sx={{ padding: 0, m: 0, bgcolor: "" }}
      >
        <Grid item xs={12}>
          {series.map((series, index) => (
            <div key={"plot-" + index}>
              {selectedWaveform[index] && (
                <Grid container key={"holder-" + index} sx={{ width: "100%" }}>
                  <Grid item key={"multend-" + index} xs={0.2}>
                    <CardActionArea
                      key={"multselect-" + index}
                      onClick={() => {
                        if (selectedPlot == index + 1) {
                          setSelectedPlot(0);
                          onMultipleAxisPlotSelected(0);
                        } else {
                          setSelectedPlot(index + 1);
                          onMultipleAxisPlotSelected(index + 1);
                        }
                      }}
                      sx={{
                        height: "100%",
                        width: "100%",
                        alignContent: "center",
                        bgcolor: selectedPlot == index + 1 ? selectedColor : "",
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    key={"multiple-" + index}
                    xs={11.8}
                    height={PlotHeight}
                  >
                    <ResponsiveChartContainerPro
                      key={"multchart-" + index}
                      xAxis={[{ ...xAxisCommon, data: timeValues }]}
                      yAxis={[{ id: yAxisNames[index] }]}
                      series={[series]}
                      zoom={zoom}
                      margin={{
                        left: leftMargin,
                        right: rightMargin,
                        top: 0,
                        bottom: 0,
                      }}
                      sx={{
                        bgcolor: selectedPlot == index + 1 ? "azure" : "",
                        borderTop: 0,
                        borderBottom: 0,
                        "& .MuiLineElement-root": {
                          strokeWidth: 1.5,
                        },
                      }}
                    >
                      <ChartsTooltip trigger={markerStatus ? "axis" : "none"} />
                      <ChartsAxisHighlight />
                      {/* <ChartsGrid horizontal /> */}
                      <ChartsOnAxisClickHandler
                        onAxisClick={(event, data) => {
                          handleAxisClick(
                            event,
                            data ? data.dataIndex : 0,
                            data
                              ? Number(data.axisValue ? data.axisValue : 0)
                              : 0
                          );
                        }}
                      />
                      <g clipPath={`url(#${clipPathIds[index]})`}>
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
                        <ChartsReferenceLine
                          axisId={yAxisNames[index]}
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
                      </g>
                      <ChartsClipPath id={clipPathIds[index]} />
                      <ChartsYAxis
                        disableTicks
                        position="left"
                        axisId={yAxisNames[index]}
                        tickInterval={[0]}
                      />
                      <ChartsYAxis
                        disableTicks
                        position="right"
                        label={signals[index]}
                        labelStyle={{
                          fontSize: 10,
                          angle: -90,
                          transform: "translateX(-10px)",
                        }}
                        axisId={yAxisNames[index]}
                        tickInterval={[]}
                      />
                    </ResponsiveChartContainerPro>
                  </Grid>
                </Grid>
              )}
            </div>
          ))}
        </Grid>
        <Grid
          key={"multiple-timeaxis"}
          item
          xs={12}
          height="40px"
          sx={{ bgcolor: "", borderLeft: 0, borderRight: 0 }}
        >
          <ResponsiveChartContainerPro
            xAxis={[{ ...xAxisCommon, data: timeValues }]}
            yAxis={[
              { id: "y-axis" },
              //  { zoom: true }
            ]}
            series={[]}
            zoom={zoom}
            margin={{
              left: leftMargin,
              right: rightMargin,
              top: 0,
              bottom: 40,
            }}
            sx={{
              borderLeft: 0,
              borderRight: 0,
              borderTop: 0,
              borderBottom: 0,
            }}
          >
            <ChartsXAxis
              axisId="time-axis"
              position="bottom"
              label="Time (seconds)"
              tickInterval={tickInterval}
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

export default MultipleAxisChart;
