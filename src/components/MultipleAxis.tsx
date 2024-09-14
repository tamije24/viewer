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
  });
  const [secondaryCursor, setSecondaryCursor] = useState({
    cursor: cursorValues.secondary,
    time: cursorValues.secondaryTime,
  });

  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: zoomBoundary.startPercent,
      end: zoomBoundary.endPercent,
    },
  ]);

  let timeValues: number[] = [];
  let series: LineSeriesType[] = [];

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

  if (
    zoom[0].start !== zoomBoundary.startPercent &&
    zoom[0].end !== zoomBoundary.endPercent
  )
    setZoom([
      {
        axisId: "time-axis",
        start: zoomBoundary.startPercent,
        end: zoomBoundary.endPercent,
      },
    ]);

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
      timeValues = arrayColumn(analog_values, 0);
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

    const xAxisCommon = {
      id: "time-axis",
      scaleType: "point",
      zoom: { filterMode: "discard" },
      tickInterval: (value: number) => value % 0.5 === 0,
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
        <CardContent sx={{ height: `calc(100vh - 290px)` }}>
          <Grid container height="100%" sx={{ bgcolor: "" }}>
            {!loading ? (
              series.map((series, index) => (
                <Grid
                  key={"multiple" + index}
                  item
                  xs={12}
                  height={index < 5 ? `calc((90%)/6)` : `calc((100%)/6+150px)`}
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
                      bottom: index < 5 ? 0 : 50,
                    }}
                    sx={{
                      borderLeft: 0.5,
                      borderRight: 0.5,
                      borderTop: 0.5,
                      borderBottom: index < 5 ? 0 : 0.5,
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
                    <ChartsGrid vertical horizontal />
                    <LinePlot />
                    {index === 5 && (
                      <ChartsXAxis
                        axisId="time-axis"
                        position="bottom"
                        label="Time (seconds)"
                      />
                    )}
                    {/* <ChartsYAxis axisId="y-axis" position="left" label="" /> */}
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
              ))
            ) : (
              <Grid item xs={12}>
                Loading ...
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  }
};

export default MultipleAxis;
