import { useState } from "react";
import useId from "@mui/utils/useId";

import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import {
  AreaPlot,
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

interface Props {
  analogSignalNames: string[];
  digitalSignalNames: string[];
  analogValues_filtered: number[][];
  digitalValues_filtered: number[][];
  timeValues: number[];
  timeStamps: string[];
  originalIndexes: number[];
  presentZoomValues: {
    startPercent: number;
    endPercent: number;
  };
  tickInterval: number[];
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
}

const SingleAxisChart = ({
  analogSignalNames,
  digitalSignalNames,
  analogValues_filtered,
  digitalValues_filtered,
  timeValues,
  timeStamps,
  originalIndexes,
  presentZoomValues,
  tickInterval,
  toolTipStatus,
  cursorValues,
  onAxisClick,
  presentSaxisYZoomValues,
}: Props) => {
  // STATE VARIABLES
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: presentZoomValues.startPercent,
      end: presentZoomValues.endPercent,
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
  ]);
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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errMessage, setErrorMessage] = useState("");

  // OTHER VARIABLES
  let current_series: LineSeriesType[] = [];
  let voltage_series: LineSeriesType[] = [];
  let digital_series: LineSeriesType[] = [];

  let color_light = ["crimson", "goldenrod", "deepskyblue"];
  const id = useId();
  const clipPathId_1 = `${id}-clip-path-1`;
  const clipPathId_2 = `${id}-clip-path-2`;
  const clipPathId_3 = `${id}-clip-path-3`;

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
  for (let i = 0; i < 3; i++) {
    let label = analogSignalNames[i];
    let a: LineSeriesType = {
      type: "line",
      label: label,
      data: analogValues_filtered[i],
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

  voltage_series = [];
  for (let i = 3; i < 6; i++) {
    let label = analogSignalNames[i];
    let a: LineSeriesType = {
      type: "line",
      label: label,
      data: analogValues_filtered[i],
      yAxisId: "voltageAxis",
      showMark: false,
      color: color_light[i - 3],
      highlightScope: {
        highlighted: "series",
        faded: "global",
      } as HighlightScope,
    };
    voltage_series.push(a);
  }

  let baseline = [0.5, 1.5, 2.5, 3.5];
  for (let i = 0; i < 4; i++) {
    // if (digitalSignalNames[i] === "") continue;

    let label = digitalSignalNames[i];
    let d: LineSeriesType = {
      type: "line",
      yAxisId: "status",
      label: label,
      data: digitalValues_filtered[i],
      showMark: false,
      area: true,
      baseline: baseline[i],
      highlightScope: {
        highlighted: "series",
        faded: "global",
      } as HighlightScope,
    };
    digital_series.push(d);
  }

  // X-axis zoom value changed
  if (
    zoom[0].start !== presentZoomValues.startPercent ||
    zoom[0].end !== presentZoomValues.endPercent
  ) {
    let temp = [...zoom];
    temp[0] = {
      axisId: "time-axis",
      start: presentZoomValues.startPercent,
      end: presentZoomValues.endPercent,
    };
    setZoom(temp);
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

  // Y-axis zoom value changed
  let tempZoom = [...zoom];
  if (zoom[1].start !== presentSaxisYZoomValues[0].start) {
    tempZoom[1] = {
      axisId: "currentAxis",
      start: presentSaxisYZoomValues[0].start,
      end: presentSaxisYZoomValues[0].end,
    };
    setZoom(tempZoom);
  } else if (zoom[2].start !== presentSaxisYZoomValues[1].start) {
    tempZoom[2] = {
      axisId: "voltageAxis",
      start: presentSaxisYZoomValues[1].start,
      end: presentSaxisYZoomValues[1].end,
    };
    setZoom(tempZoom);
  }

  // cursor value update
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

  const timeFormatter = (
    timevalue: number,
    context: AxisValueFormatterContext
  ) => {
    let timeInd = timeValues.findIndex((element) => element === timevalue);
    return context.location === "tick" ? `${timevalue}` : timeStamps[timeInd];
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

  const leftMargin = 20;
  const rightMargin = 20;

  // console.log("single axis: ", primaryCursor);
  return (
    <>
      <Grid
        container
        padding="0"
        margin="0"
        height={`calc(100vh - 290px)`}
        sx={{ bgcolor: "" }}
      >
        <Grid
          item
          xs={12}
          key="current_chart"
          sx={{ height: `calc((100vh - 330px)*0.45)` }}
        >
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
            onZoomChange={setZoom}
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
              //       border: 0.5,
            }}
          >
            <ChartsTooltip trigger={toolTipStatus ? "axis" : "none"} />
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
              <LinePlot skipAnimation />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={0}
                lineStyle={{
                  strokeDasharray: "5 1",
                  strokeWidth: 1.0,
                  stroke: "secondary",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[primaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "10 5",
                  strokeWidth: 2,
                  stroke: "crimson",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[secondaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "3 3",
                  strokeWidth: 2,
                  stroke: "forestgreen",
                }}
              />
            </g>
            <ChartsYAxis
              disableTicks
              position="left"
              axisId="currentAxis"
              tickInterval={[]}
            />
            <ChartsYAxis
              disableTicks
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

        <Grid
          item
          xs={12}
          key="voltage_chart"
          sx={{ height: `calc((100vh - 330px)*0.45)` }}
        >
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
            onZoomChange={setZoom}
            margin={{ left: leftMargin, right: rightMargin, top: 0, bottom: 0 }}
            sx={{
              "& .MuiLineElement-root": {
                strokeWidth: 1.5,
              },
              //  border: 0.5,
            }}
          >
            <ChartsTooltip trigger={toolTipStatus ? "axis" : "none"} />
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
              tickInterval={[]}
            />
            <ChartsYAxis
              disableTicks
              position="right"
              axisId="voltageAxis"
              tickInterval={[]}
            />
            <g clipPath={`url(#${clipPathId_2})`}>
              <LinePlot />
              skipAnimation
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={0}
                lineStyle={{
                  strokeDasharray: "5 1",
                  strokeWidth: 1.0,
                  stroke: "secondary",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[primaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "10 5",
                  strokeWidth: 2,
                  stroke: "crimson",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[secondaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "3 3",
                  strokeWidth: 2,
                  stroke: "forestgreen",
                }}
              />
            </g>
            <ChartsClipPath id={clipPathId_2} />
          </ResponsiveChartContainerPro>
        </Grid>

        <Grid item xs={12} sx={{ height: `calc((100vh - 330px)*0.1)` }}>
          <ResponsiveChartContainerPro
            key="digital-signals"
            xAxis={[{ ...xAxisCommon, data: timeValues }]}
            yAxis={[
              { id: "status" },
              //  { zoom: true }
            ]}
            series={digital_series}
            zoom={zoom}
            onZoomChange={setZoom}
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
              // borderLeft: 0.5,
              // borderRight: 0.5,
              // borderBottom: 0.5,
            }}
          >
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
              position="right"
              axisId="status"
              tickInterval={[]}
            />
            <g clipPath={`url(#${clipPathId_3})`}>
              <AreaPlot skipAnimation />
              <LinePlot skipAnimation />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={0}
                lineStyle={{
                  strokeDasharray: "5 1",
                  strokeWidth: 1.0,
                  stroke: "secondary",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[primaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "10 5",
                  strokeWidth: 2,
                  stroke: "crimson",
                }}
              />
              <ChartsReferenceLine
                axisId={"time-axis"}
                x={timeValues[secondaryCursor.cursorReduced]}
                lineStyle={{
                  strokeDasharray: "3 3",
                  strokeWidth: 2,
                  stroke: "forestgreen",
                }}
              />
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

        <Grid
          key={"single-timeaxis"}
          item
          xs={12}
          height="40px"
          sx={{ bgcolor: "", borderLeft: 0, borderRight: 0 }}
        >
          <ResponsiveChartContainerPro
            xAxis={[
              {
                ...xAxisCommon,
                data: timeValues,
                // data: timeValues_original
              },
            ]}
            yAxis={[
              { id: "y-axis" },
              //  { zoom: true }
            ]}
            series={[]}
            zoom={zoom}
            onZoomChange={setZoom}
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
