import { useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { ZoomData } from "@mui/x-charts-pro/context";
import { HighlightScope } from "@mui/x-charts/context";

import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";

import ChartFooter from "./ChartFooter";
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

interface Props {
  stationName: string;
  analogSignals: AnalogSignal[];
  analogSignalNames: string[];
  digitalSignals: DigitalSignal[];
  digitalSignalNames: string[];
  start_time_stamp: Date;
  trigger_time_stamp: Date;
  error: string;
  isLoading: boolean;
  cursorValues: {
    primary: number;
    primaryTime: number;
    secondary: number;
    secondaryTime: number;
  };
  onAxisClick: (
    dataIndex: number,
    axisValue: number,
    secondaryIndex: number,
    secondaryValue: number
  ) => void;
  zoomBoundary: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  };
  onZoomBoundaryChange: (
    startPercent: number,
    endPercent: number,
    startTime: number,
    endTime: number
  ) => void;
}

const SingleAxis = ({
  stationName,
  analogSignals,
  analogSignalNames,
  digitalSignals,
  digitalSignalNames,
  // start_time_stamp,
  // trigger_time_stamp,
  error,
  isLoading,
  cursorValues,
  onAxisClick,
  zoomBoundary,
  onZoomBoundaryChange,
}: Props) => {
  const [primaryCursor, setPrimaryCursor] = useState({
    cursor: cursorValues.primary,
    time: cursorValues.primaryTime,
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
    time: cursorValues.secondaryTime,
  });
  const [anLoading, setAnLoading] = useState(true);
  const [digLoading, setDigLoading] = useState(true);
  const [isTooltip, setIsTooltip] = useState(false);
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: zoomBoundary.startPercent,
      end: zoomBoundary.endPercent,
    },
  ]);
  const [zoomLimits, setZoomLimits] = useState({
    start: zoomBoundary.startTime,
    end: zoomBoundary.endTime,
  });

  let timeValues: number[] = [];
  let current_series: LineSeriesType[] = [];
  let voltage_series: LineSeriesType[] = [];
  let digital_series: LineSeriesType[] = [];

  const handleTooltipStatusChange = (toolTipStatus: boolean) => {
    setIsTooltip(toolTipStatus);
  };

  const handleZoomoutClick = () => {
    setZoom([{ axisId: "time-axis", start: 0, end: 100 }]);
    setZoomLimits({ start: 0, end: timeValues[timeValues.length - 1] });
    onZoomBoundaryChange(0, 100, 0, timeValues[timeValues.length - 1]);
    //  calculateTickValues();
  };

  const handleZoominClick = (fromValue: number, toValue: number) => {
    // fromValue = fromValue * 1000;
    // toValue = toValue * 1000;
    const maxValue = timeValues[timeValues.length - 1];
    if (fromValue >= maxValue || toValue > maxValue) return;
    const fromPercent = (fromValue / maxValue) * 100;
    const toPercent = (toValue / maxValue) * 100;

    setZoom([{ axisId: "time-axis", start: fromPercent, end: toPercent }]);
    setZoomLimits({ start: fromValue, end: toValue });
    onZoomBoundaryChange(fromPercent, toPercent, fromValue, toValue);
    //  calculateTickValues();
  };

  const handleAxisClick = (
    event: MouseEvent,
    dataIndex: number,
    axisValue: number
  ) => {
    if (event.shiftKey) {
      setSecondaryCursor({ cursor: dataIndex, time: axisValue });
      onAxisClick(
        primaryCursor.cursor,
        primaryCursor.time,
        dataIndex,
        axisValue
      );
    } else {
      setPrimaryCursor({ cursor: dataIndex, time: axisValue });
      onAxisClick(
        dataIndex,
        axisValue,
        secondaryCursor.cursor,
        secondaryCursor.time
      );
    }
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
    const analog_values = [];
    if (!isLoading && analogSignals !== undefined && analogSignals.length > 0) {
      let L = analogSignals.length;
      for (let i = 0; i < L; i++) {
        let value = Object.values(analogSignals[i]);
        analog_values.push(value);
      }

      //  for (let k = 0; k < timeValues.length; k++) timeValues.pop();

      // let time = arrayColumn(analog_values, 0);
      // for (let k = 0; k < time.length; k++) {
      //   let start_time = new Date(start_time_stamp);
      //   start_time.setTime(start_time.getTime() + time[k] * 1000);
      //   timeValues.push(start_time);
      // }

      timeValues = arrayColumn(analog_values, 0);
      // for (let k = 0; k < timeValues.length; k++)
      //   timeValues[k] = timeValues[k] * 1000;

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
    }

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
      for (let i = 0; i < 4; i++) {
        if (digitalSignalNames[i] === "") continue;

        let label = digitalSignalNames[i];
        let values = arrayColumn(digital_values, i + 1);
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

    const xAxisCommon = {
      id: "time-axis",
      scaleType: "point",
      zoom: true,
      tickInterval: (value: number) => value % 0.5 === 0,
    } as const;

    return (
      <Card sx={{ mt: 10, ml: 2, mb: 8, height: `calc(100vh - 150px)` }}>
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
        <CardContent sx={{ mb: 0.5, height: `calc(100vh - 280px)` }}>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{ mb: 0, height: `calc((100vh - 290px)*0.35)`, bgcolor: "" }}
            >
              <ResponsiveChartContainerPro
                key="current-signals"
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
                  left: 0,
                  right: 0,
                  top: 40,
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
                <ChartsTooltip trigger={isTooltip ? "axis" : "none"} />
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
                <ChartsGrid horizontal vertical />
                <ChartsLegend
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
                />
                <LinePlot />
                {/* <ChartsYAxis
                  axisId="currentAxis"
                  position="left"
                  label="Current"
                /> */}
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
              sx={{ mb: 0, height: `calc((100vh - 290px)*0.35)`, bgcolor: "" }}
            >
              <ResponsiveChartContainerPro
                key="voltage-signals"
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
                margin={{
                  left: 0,
                  right: 0,
                  top: 40,
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
                <ChartsTooltip trigger={isTooltip ? "axis" : "none"} />
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
                <ChartsGrid horizontal vertical />
                <ChartsLegend
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
                />
                <LinePlot />
                {/* <ChartsYAxis
                  axisId="voltageAxis"
                  position="left"
                  label="Voltage"
                /> */}
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
                height: `calc((100vh - 290px)*0.3)`,
              }}
            >
              {!digLoading ? (
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
                    left: 0,
                    right: 0,
                    top: 30,
                    bottom: 60,
                  }}
                  sx={{
                    "& .MuiLineElement-root": {
                      strokeWidth: 1.5,
                    },
                    borderLeft: 0.5,
                    borderRight: 0.5,
                  }}
                >
                  <ChartsGrid vertical />
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
                  />
                  {/* <ChartsYAxis
                    axisId="status"
                    position="left"
                    label=""
                    disableTicks
                    tickInterval={[10]}
                  /> */}
                  {timeValues !== undefined && timeValues.length > 0 && (
                    <ChartsReferenceLine
                      axisId={"time-axis"}
                      x={timeValues[primaryCursor.cursor]}
                      lineStyle={{
                        strokeDasharray: "10 5",
                        strokeWidth: 2,
                        stroke: "salmon",
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
        <CardActions
          sx={{
            justifyContent: "flex-end",
            bgcolor: "Highlight",
            height: "60px",
            alignContent: "center",
          }}
        >
          <ChartFooter
            onToolTipStatusChange={handleTooltipStatusChange}
            zoomBoundary={zoomLimits}
            onZoomOutClick={handleZoomoutClick}
            onZoomInClick={handleZoominClick}
          />
        </CardActions>
      </Card>
    );
  }
};

export default SingleAxis;
