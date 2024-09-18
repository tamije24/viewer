import { useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { ZoomData } from "@mui/x-charts-pro/context";
import { HighlightScope } from "@mui/x-charts/context";

import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";

import { AnalogSignal } from "../services/analog-signal-service";
import { DigitalSignal } from "../services/digital-signal-service";
import {
  AreaPlot,
  ChartsAxisHighlight,
  // ChartsClipPath,
  ChartsGrid,
  ChartsLegend,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  //ChartsYAxis,
  LinePlot,
  LineSeriesType,
  ResponsiveChartContainerPro,
} from "@mui/x-charts-pro";

import { ChartsLoadingOverlay } from "@mui/x-charts/ChartsOverlay";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";

interface Props {
  stationName: string;
  analogSignals: AnalogSignal[];
  analogSignalNames: string[];
  digitalSignals: DigitalSignal[];
  digitalSignalNames: string[];
  error: string;
  isLoading: boolean;
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
  zoomBoundary: {
    startPercent: number;
    endPercent: number;
  };
  toolTipStatus: boolean;
}

const SingleAxis = ({
  stationName,
  analogSignals,
  analogSignalNames,
  digitalSignals,
  digitalSignalNames,
  error,
  isLoading,
  cursorValues,
  onAxisClick,
  zoomBoundary,
  toolTipStatus,
}: Props) => {
  const [primaryCursor, setPrimaryCursor] = useState({
    cursor: cursorValues.primary,
    time: cursorValues.primaryTime,
    timestamp: cursorValues.primaryTimestamp,
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
    time: cursorValues.secondaryTime,
    timestamp: cursorValues.secondaryTimestamp,
  });
  const [anLoading, setAnLoading] = useState(true);
  const [digLoading, setDigLoading] = useState(true);
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: zoomBoundary.startPercent,
      end: zoomBoundary.endPercent,
    },
  ]);

  const [tickInterval, setTickInterval] = useState<number[]>([]);
  const [textTickInterval, setTextTickInterval] = useState<number[]>([0, 0, 0]);

  let timeValues: number[] = [];
  let timeStamps: string[] = [];
  let current_series: LineSeriesType[] = [];
  let voltage_series: LineSeriesType[] = [];
  let digital_series: LineSeriesType[] = [];

  const handleAxisClick = (
    event: MouseEvent,
    dataIndex: number,
    axisValue: number
  ) => {
    let tempTicks = [...textTickInterval];

    if (event.shiftKey) {
      setSecondaryCursor({
        cursor: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });
      onAxisClick(
        primaryCursor.cursor,
        primaryCursor.time,
        primaryCursor.timestamp,
        dataIndex,
        axisValue,
        timeStamps[dataIndex]
      );
      tempTicks[2] = axisValue;
    } else {
      setPrimaryCursor({
        cursor: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });
      onAxisClick(
        dataIndex,
        axisValue,
        timeStamps[dataIndex],
        secondaryCursor.cursor,
        secondaryCursor.time,
        secondaryCursor.timestamp
      );
      tempTicks[1] = axisValue;
    }
    setTextTickInterval(tempTicks);
  };

  const calculateTickInterval = () => {
    if (timeValues === undefined) return;

    let minValue = timeValues[0];
    let maxValue = timeValues[timeValues.length - 1];
    let duration = maxValue - minValue;
    let startTime = (zoomBoundary.startPercent / 100) * duration + minValue;
    let endTime = (zoomBoundary.endPercent / 100) * duration + minValue;
    let timeDiff = Math.abs(endTime - startTime);

    let firstTick = Math.round(startTime * 100) / 100;
    let lastTick = Math.round(endTime * 100) / 100;
    let tickSize: number = 0;

    if (timeDiff > 3) tickSize = 0.5;
    else if (timeDiff > 2) tickSize = 0.2;
    else if (timeDiff > 1) tickSize = 0.1;
    else if (timeDiff > 0.5) tickSize = 0.05;
    else if (timeDiff > 0.2) tickSize = 0.02;
    else if (timeDiff > 0.1) tickSize = 0.01;
    else tickSize = 0.001;

    let tickIntervalArray: number[] = [];
    for (let i = firstTick; i <= lastTick; i = i + tickSize) {
      tickIntervalArray.push(Math.round(i * 100) / 100);
    }
    setTickInterval(tickIntervalArray);
  };

  if (error) {
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 1, mb: 2 }}>
        <Typography
          variant="overline"
          component="div"
          color="firebrick"
          sx={{ flexGrow: 1 }}
        >
          {error}
        </Typography>
      </Box>
    );
  } else {
    const arrayColumn = (arr: number[][], n: number) => arr.map((x) => x[n]);
    const strArrayColumn = (arr: string[][], n: number) => arr.map((x) => x[n]);

    const analog_values = [];
    if (!isLoading && analogSignals !== undefined && analogSignals.length > 0) {
      let L = analogSignals.length;
      for (let i = 0; i < L; i++) {
        let value = Object.values(analogSignals[i]);
        analog_values.push(value);
      }

      timeValues = [];
      timeStamps = [];
      current_series = [];
      voltage_series = [];

      timeValues = arrayColumn(analog_values, 0);
      timeStamps = strArrayColumn(analog_values, 7);
      if (tickInterval.length === 0) calculateTickInterval();

      let color_light = [
        "crimson",
        "goldenrod",
        "deepskyblue",
        "crimson",
        "goldenrod",
        "deepskyblue",
      ];

      for (let i = 0; i < 3; i++) {
        let label = analogSignalNames[i];
        let values = arrayColumn(analog_values, i + 1);
        // console.log(label, ": ", values.length);

        let a: LineSeriesType = {
          type: "line",
          label: label,
          data: values,
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

      for (let i = 3; i < 6; i++) {
        let label = analogSignalNames[i];
        let values = arrayColumn(analog_values, i + 1);

        let a: LineSeriesType = {
          type: "line",
          label: label,
          data: values,
          yAxisId: "voltageAxis",
          showMark: false,
          color: color_light[i],
          highlightScope: {
            highlighted: "series",
            faded: "global",
          } as HighlightScope,
        };
        voltage_series.push(a);
      }

      if (anLoading) setAnLoading(false);

      if (
        !isLoading &&
        digitalSignals !== undefined &&
        digitalSignals.length > 0
      ) {
        const digital_values = [];

        let L = digitalSignals.length;
        for (let i = 0; i < L; i++) {
          let value = Object.values(digitalSignals[i]);
          value[2] += 1.5;
          value[3] += 3;
          value[4] += 4.5;
          digital_values.push(value);
        }

        let baseline = [0, 1.5, 3, 4.5];
        for (let k = 0; k < digital_series.length; k++) digital_series.pop();

        for (let i = 0; i < 4; i++) {
          // if (digitalSignalNames[i] === "") continue;

          let label = digitalSignalNames[i];
          let values = arrayColumn(digital_values, i + 1);

          // console.log(label, ": ", values.length);

          let d: LineSeriesType = {
            type: "line",
            yAxisId: "status",
            label: label,
            data: values,
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
        if (digLoading && timeValues.length > 0) setDigLoading(false);
      }

      if (
        zoom[0].start !== zoomBoundary.startPercent ||
        zoom[0].end !== zoomBoundary.endPercent
      ) {
        setZoom([
          {
            axisId: "time-axis",
            start: zoomBoundary.startPercent,
            end: zoomBoundary.endPercent,
          },
        ]);

        calculateTickInterval();
      }
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
      data: timeValues,
      valueFormatter: timeFormatter,
    } as const;

    return (
      <Card sx={{ mt: 10, ml: 2, mb: 0.5, height: `calc(100vh - 220px)` }}>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                m: 1,
                bgcolor: "cadetblue",
              }}
            >
              <AutoAwesomeMotionSharpIcon />
            </Avatar>
          }
          title={stationName}
          subheader="Single Axis View"
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent sx={{ height: `calc(100vh - 350px)` }}>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                height: `calc((100vh - 350px)*0.35)`,
                bgcolor: "",
              }}
            >
              <ResponsiveChartContainerPro
                key="current-signals"
                xAxis={[
                  {
                    ...xAxisCommon,
                  },
                ]}
                yAxis={[{ id: "currentAxis" }]}
                series={current_series}
                zoom={zoom}
                onZoomChange={setZoom}
                margin={{
                  left: 0,
                  right: 0,
                  top: 30,
                  bottom: 0,
                }}
                sx={{
                  "& .MuiLineElement-root": {
                    strokeWidth: 1.5,
                  },
                  border: 0.5,
                }}
              >
                {anLoading && <ChartsLoadingOverlay />}
                <ChartsTooltip trigger={toolTipStatus ? "axis" : "none"} />
                <ChartsAxisHighlight />
                <ChartsOnAxisClickHandler
                  onAxisClick={(event, data) => {
                    handleAxisClick(
                      event,
                      data ? data.dataIndex : 0,
                      data ? Number(data.axisValue ? data.axisValue : 0) : 0
                    );
                  }}
                />
                <ChartsGrid horizontal />
                {/* <ChartsLegend
                  axisDirection="x"
                  position={{ vertical: "top", horizontal: "right" }}
                  direction="row"
                  padding={0}
                  slotProps={{
                    legend: {
                      itemMarkHeight: 3,
                      labelStyle: {
                        fontSize: 11,
                      },
                    },
                  }}
                /> */}
                <LinePlot />
                <ChartsXAxis
                  disableTicks
                  disableLine
                  position="top"
                  axisId="time-axis"
                  tickInterval={textTickInterval}
                  valueFormatter={timeStampFormatter}
                  tickLabelStyle={{ fontSize: "10" }}
                />

                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={0}
                    lineStyle={{
                      strokeDasharray: "5 1",
                      strokeWidth: 1.0,
                      stroke: "black",
                    }}
                    // labelStyle={{ fontSize: "8" }}
                    // label={triggerTime()}
                    // labelAlign="start"
                  />
                )}

                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={timeValues[primaryCursor.cursor]}
                    lineStyle={{
                      strokeDasharray: "10 5",
                      strokeWidth: 2,
                      stroke: "crimson",
                    }}
                  />
                )}

                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={timeValues[secondaryCursor.cursor]}
                    lineStyle={{
                      strokeDasharray: "3 3",
                      strokeWidth: 2,
                      stroke: "forestgreen",
                    }}
                  />
                )}
              </ResponsiveChartContainerPro>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ height: `calc((100vh - 350px)*0.35)`, bgcolor: "" }}
            >
              <ResponsiveChartContainerPro
                key="voltage-signals"
                xAxis={[{ ...xAxisCommon }]}
                yAxis={[{ id: "voltageAxis" }]}
                series={voltage_series}
                zoom={zoom}
                onZoomChange={setZoom}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
                sx={{
                  "& .MuiLineElement-root": {
                    strokeWidth: 1.5,
                  },
                  border: 0.5,
                }}
              >
                {anLoading && <ChartsLoadingOverlay />}
                <ChartsTooltip trigger={toolTipStatus ? "axis" : "none"} />
                <ChartsAxisHighlight />
                <ChartsOnAxisClickHandler
                  onAxisClick={(event, data) => {
                    handleAxisClick(
                      event,
                      data ? data.dataIndex : 0,
                      data ? Number(data.axisValue ? data.axisValue : 0) : 0
                    );
                  }}
                />
                <ChartsGrid horizontal />
                {/* <ChartsLegend
                  axisDirection="x"
                  position={{ vertical: "top", horizontal: "right" }}
                  direction="row"
                  padding={0}
                  slotProps={{
                    legend: {
                      itemMarkHeight: 3,
                      labelStyle: {
                        fontSize: 11,
                      },
                    },
                  }}
                /> */}
                <LinePlot />
                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={0}
                    lineStyle={{
                      strokeDasharray: "5 1",
                      strokeWidth: 1.0,
                      stroke: "black",
                    }}
                  />
                )}
                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={timeValues[primaryCursor.cursor]}
                    lineStyle={{
                      strokeDasharray: "10 5",
                      strokeWidth: 2,
                      stroke: "crimson",
                    }}
                  />
                )}
                {timeValues !== undefined && timeValues.length > 0 && (
                  <ChartsReferenceLine
                    axisId={"time-axis"}
                    x={timeValues[secondaryCursor.cursor]}
                    lineStyle={{
                      strokeDasharray: "3 3",
                      strokeWidth: 2,
                      stroke: "forestgreen",
                    }}
                  />
                )}
              </ResponsiveChartContainerPro>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                mb: 0,
                height: `calc((100vh - 350px)*0.33)`,
              }}
            >
              {!digLoading ? (
                <ResponsiveChartContainerPro
                  key="digital-signals"
                  xAxis={[{ ...xAxisCommon }]}
                  yAxis={[
                    { id: "status" },
                    //  { zoom: true }
                  ]}
                  series={digital_series}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  margin={{
                    left: 0,
                    right: 0,
                    top: 30,
                    bottom: 50,
                  }}
                  sx={{
                    "& .MuiLineElement-root": {
                      strokeWidth: 1.5,
                    },
                    borderLeft: 0.5,
                    borderRight: 0.5,
                    borderBottom: 0.5,
                  }}
                >
                  {/* <ChartsGrid vertical /> */}
                  <AreaPlot />
                  <LinePlot />
                  <ChartsTooltip trigger={"none"} />
                  <ChartsAxisHighlight />
                  <ChartsOnAxisClickHandler
                    onAxisClick={(event, data) => {
                      handleAxisClick(
                        event,
                        data ? data.dataIndex : 0,
                        data ? Number(data.axisValue ? data.axisValue : 0) : 0
                      );
                    }}
                  />
                  <ChartsLegend
                    axisDirection="x"
                    position={{ vertical: "top", horizontal: "right" }}
                    direction="row"
                    sx={{ mr: 5 }}
                    padding={10}
                    slotProps={{
                      legend: {
                        itemMarkHeight: 1.5,
                        labelStyle: {
                          fontSize: 10,
                        },
                      },
                    }}
                  />

                  <ChartsXAxis
                    label="Time (seconds)"
                    position="bottom"
                    axisId="time-axis"
                    tickInterval={tickInterval}
                  />
                  {timeValues !== undefined && timeValues.length > 0 && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={0}
                      lineStyle={{
                        strokeDasharray: "5 1",
                        strokeWidth: 1.0,
                        stroke: "black",
                      }}
                    />
                  )}
                  {timeValues !== undefined && timeValues.length > 0 && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[primaryCursor.cursor]}
                      lineStyle={{
                        strokeDasharray: "10 5",
                        strokeWidth: 2,
                        stroke: "crimson",
                      }}
                    />
                  )}
                  {timeValues !== undefined && timeValues.length > 0 && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[secondaryCursor.cursor]}
                      lineStyle={{
                        strokeDasharray: "3 3",
                        strokeWidth: 2,
                        stroke: "forestgreen",
                      }}
                    />
                  )}
                </ResponsiveChartContainerPro>
              ) : (
                <Typography align="center" variant="body2" sx={{ mt: 2 }}>
                  Loading digital signals ...
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
};

export default SingleAxis;
