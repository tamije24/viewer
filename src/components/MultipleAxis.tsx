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
    time: cursorValues.primaryTime,
    timestamp: cursorValues.primaryTimestamp,
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
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

  let timeValues: number[] = [];
  let timeStamps: string[] = [];
  let series: LineSeriesType[] = [];

  const handleAxisClick = (
    event: MouseEvent,
    dataIndex: number,
    axisValue: number
  ) => {
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
      series = [];

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
      for (let i = 0; i < 6; i++) {
        let label = analogSignalNames[i];
        let values = arrayColumn(analog_values, i + 1);
        let a: LineSeriesType = {
          type: "line",
          label: label,
          yAxisId: "y-axis",
          data: values,
          color: color_light[i],
          showMark: false,
        };
        series.push(a);
      }

      if (loading) setLoading(false);
    }

    if (
      zoom[0].start !== zoomBoundary.startPercent &&
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

    const xAxisCommon = {
      id: "time-axis",
      scaleType: "point",
      zoom: { filterMode: "discard" },
      //   tickInterval: (value: number) => value % 0.5 === 0,
    } as const;

    return (
      <Card sx={{ mt: 10, ml: 2, mb: 0.5, height: `calc(100vh - 220px)` }}>
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
              ))}
              <Grid
                key={"multiple-timeaxis"}
                item
                xs={12}
                height="50px"
                sx={{ bgcolor: "" }}
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
                    bottom: 50,
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
