import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import Typography from "@mui/material/Typography";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { ZoomData } from "@mui/x-charts-pro/context";

import Grid from "@mui/material/Grid";
import Dns from "@mui/icons-material/Dns";
import { AnalogSignal } from "../services/analog-signal-service";
import { ChartsLoadingOverlay } from "@mui/x-charts/ChartsOverlay/ChartsLoadingOverlay";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";

import {
  ChartsAxisHighlight,
  ChartsGrid,
  //  ChartsLegend,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  // ChartsYAxis,
  LinePlot,
  LineSeriesType,
  ResponsiveChartContainerPro,
} from "@mui/x-charts-pro";

interface Props {
  stationName: string;
  analogSignals: AnalogSignal[];
  analogSignalNames: string[];
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

const MultipleAxis = ({
  stationName,
  analogSignals,
  analogSignalNames,
  error,
  isLoading,
  cursorValues,
  onAxisClick,
  zoomBoundary,
  toolTipStatus,
}: Props) => {
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

  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: zoomBoundary.startPercent,
      end: zoomBoundary.endPercent,
    },
  ]);

  const [tickInterval, setTickInterval] = useState<number[]>([]);
  const [triggerPoint, setTriggerPoint] = useState(0);

  const [originalIndexes, setOriginalIndexes] = useState<number[]>([]);
  const [timeValues, setTimeValues] = useState<number[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);

  const [analogValues_filtered, setAnalogValues_filtered] = useState<
    number[][]
  >([[], [], [], [], [], []]);

  let series: LineSeriesType[] = [];
  let analogValues: number[][] = [];
  let timeValues_original: number[] = [];
  let timeStamps_original: string[] = [];

  const handleAxisClick = (
    event: MouseEvent,
    dataIndex: number,
    axisValue: number
  ) => {
    if (event.shiftKey) {
      setSecondaryCursor({
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });
      onAxisClick(
        primaryCursor.cursor,
        primaryCursor.time,
        primaryCursor.timestamp,
        originalIndexes[dataIndex],
        axisValue,
        timeStamps[dataIndex]
      );
    } else {
      setPrimaryCursor({
        cursor: originalIndexes[dataIndex],
        cursorReduced: dataIndex,
        time: axisValue,
        timestamp: timeStamps[dataIndex],
      });
      onAxisClick(
        originalIndexes[dataIndex],
        axisValue,
        timeStamps[dataIndex],
        secondaryCursor.cursor,
        secondaryCursor.time,
        secondaryCursor.timestamp
      );
    }
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

  const reduceAllArrays = () => {
    let skipCount = 10;

    // TODO: fix logic for calculating skip count

    let maxSampleDisplayed = 500;
    let diff_sample_count =
      (timeValues_original.length *
        (zoomBoundary.endPercent - zoomBoundary.startPercent)) /
      100;

    skipCount = Math.round(diff_sample_count / maxSampleDisplayed);
    if (skipCount === 0) skipCount = 1;

    // origial indexes
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
      temp.push(reduceValues(analogValues[i], skipCount));
    setAnalogValues_filtered(temp);

    let tempVal = reduceValues(timeValues_original, skipCount);
    let timeInd = 0;

    // Update the trigger point
    timeInd = tempVal.findIndex((element) => element === 0);
    if (timeInd !== -1) setTriggerPoint(0);
    else {
      timeInd = tempVal.findIndex((element) => element > 0);
      setTriggerPoint(tempVal[timeInd]);
    }

    // Update primary cursor
    timeInd = tempVal.findIndex(
      (element) => element === timeValues[primaryCursor.cursorReduced]
    );
    if (timeInd === -1)
      timeInd = tempVal.findIndex(
        (element) => element > timeValues[primaryCursor.cursorReduced]
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
      (element) => element === timeValues[secondaryCursor.cursorReduced]
    );
    if (timeInd === -1)
      timeInd = tempVal.findIndex(
        (element) => element > timeValues[secondaryCursor.cursorReduced]
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

      timeValues_original = arrayColumn(analog_values, 0);
      timeStamps_original = strArrayColumn(analog_values, 7);

      let color_light = [
        "crimson",
        "goldenrod",
        "deepskyblue",
        "crimson",
        "goldenrod",
        "deepskyblue",
      ];

      analogValues = [];
      for (let i = 0; i < 6; i++)
        analogValues.push(arrayColumn(analog_values, i + 1));

      series = [];
      for (let i = 0; i < 6; i++) {
        let label = analogSignalNames[i];
        let a: LineSeriesType = {
          type: "line",
          label: label,
          yAxisId: "y-axis",
          data: analogValues_filtered[i],
          color: color_light[i],
          showMark: false,
        };
        series.push(a);
      }

      if (loading) setLoading(false);

      if (tickInterval.length === 0) {
        reduceAllArrays();
        calculateTickInterval();
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

        reduceAllArrays();
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

    const xAxisCommon = {
      id: "time-axis",
      scaleType: "point",
      zoom: { filterMode: "discard" },
      valueFormatter: timeFormatter,
    } as const;

    return (
      <Card sx={{ mt: 10, ml: 2, mb: 0.0, height: `calc(100vh - 220px)` }}>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                m: 1,
                bgcolor: "royalblue",
              }}
            >
              <Dns />
            </Avatar>
          }
          title={stationName}
          subheader="Multiple Axis View"
          sx={{ paddingBottom: 0, height: 80, borderBottom: 0.5 }}
        />
        {!loading ? (
          <CardContent sx={{ height: `calc(100vh - 225px)` }}>
            <Grid container height={`calc(100% - 50px)`} sx={{ bgcolor: "" }}>
              {series.map((series, index) => (
                <Grid
                  key={"multiple" + index}
                  item
                  xs={12}
                  height={`calc((90%)/6)`}
                  sx={{ bgcolor: "" }}
                >
                  <ResponsiveChartContainerPro
                    xAxis={[{ ...xAxisCommon, data: timeValues }]}
                    yAxis={[
                      { id: "y-axis" },
                      //  { zoom: true }
                    ]}
                    series={loading ? [] : [series]}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    margin={{
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                    sx={{
                      borderLeft: 0.5,
                      borderRight: 0.5,
                      borderTop: 0.5,
                      borderBottom: 0,
                      "& .MuiLineElement-root": {
                        strokeWidth: 1.5,
                      },
                    }}
                  >
                    {loading && <ChartsLoadingOverlay />}
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
                    <LinePlot />
                    {timeValues !== undefined && timeValues.length > 0 && (
                      <ChartsReferenceLine
                        axisId={"time-axis"}
                        x={triggerPoint}
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
                        x={timeValues[primaryCursor.cursorReduced]}
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
                        x={timeValues[secondaryCursor.cursorReduced]}
                        lineStyle={{
                          strokeDasharray: "3 3",
                          strokeWidth: 2,
                          stroke: "forestgreen",
                        }}
                      />
                    )}
                  </ResponsiveChartContainerPro>
                </Grid>
              ))}
              <Grid
                key={"multiple-timeaxis"}
                item
                xs={12}
                height="50px"
                sx={{ bgcolor: "", borderLeft: 0, borderRight: 0 }}
              >
                <ResponsiveChartContainerPro
                  xAxis={[{ ...xAxisCommon, data: timeValues }]}
                  yAxis={[
                    { id: "y-axis" },
                    //  { zoom: true }
                  ]}
                  series={loading ? [] : [series[0]]}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 46,
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
          </CardContent>
        ) : (
          <CardContent sx={{ height: `calc(100vh - 290px)` }}>
            <Grid container height="100%" sx={{ bgcolor: "" }}>
              <Grid item xs={12}>
                Loading ...
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    );
  }
};

export default MultipleAxis;
