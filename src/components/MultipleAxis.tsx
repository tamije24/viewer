import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import Typography from "@mui/material/Typography";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { ZoomData } from "@mui/x-charts-pro/context";

import ChartFooter from "./ChartFooter";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Dns from "@mui/icons-material/Dns";
import { AnalogSignal } from "../services/analog-signal-service";
import { ChartsLoadingOverlay } from "@mui/x-charts/ChartsOverlay/ChartsLoadingOverlay";

import {
  ChartsAxisHighlight,
  ChartsGrid,
  ChartsLegend,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  //  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  LineSeriesType,
  ResponsiveChartContainerPro,
} from "@mui/x-charts-pro";

interface Props {
  analogSignals: AnalogSignal[];
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

const MultipleAxis = ({
  analogSignals,
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

  const [loading, setLoading] = useState(true);
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
  let series: LineSeriesType[] = [];
  let seriesCount = 0;

  const handleTooltipStatusChange = (toolTipStatus: boolean) => {
    setIsTooltip(toolTipStatus);
  };

  const handleZoomoutClick = () => {
    setZoom([{ axisId: "time-axis", start: 0, end: 100 }]);
    setZoomLimits({ start: 0, end: timeValues[timeValues.length - 1] });
    onZoomBoundaryChange(0, 100, 0, timeValues[timeValues.length - 1]);
  };

  const handleZoominClick = (fromValue: number, toValue: number) => {
    const maxValue = timeValues[timeValues.length - 1];
    if (fromValue >= maxValue || toValue > maxValue) return;
    const fromPercent = (fromValue / maxValue) * 100;
    const toPercent = (toValue / maxValue) * 100;

    setZoom([{ axisId: "time-axis", start: fromPercent, end: toPercent }]);
    setZoomLimits({ start: fromValue, end: toValue });
    onZoomBoundaryChange(fromPercent, toPercent, fromValue, toValue);
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
      let names = Object.keys(analogSignals[0]);
      let L = analogSignals.length;
      for (let i = 0; i < L; i++) {
        let value = Object.values(analogSignals[i]);
        analog_values.push(value);
      }
      timeValues = arrayColumn(analog_values, 0);
      seriesCount = names.length;

      for (let i = 1; i < names.length; i++) {
        let label = names[i] as string;
        let values = arrayColumn(analog_values, i);
        let a: LineSeriesType = {
          type: "line",
          label: label,
          yAxisId: "y-axis",
          data: values,
          showMark: false,
        };
        series.push(a);
      }
      if (loading) setLoading(false);
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
                bgcolor: "royalblue",
              }}
            >
              <Dns />
            </Avatar>
          }
          title="Selected Signals"
          subheader="Multiple Axis View"
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent sx={{ mb: 0.5, height: `calc(100vh - 290px)` }}>
          <Grid container>
            {!loading ? (
              series.map((series) => (
                <Grid
                  item
                  xs={12}
                  height={`calc((100vh - 210px)/${seriesCount})`}
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
                      top: 30,
                      bottom: 0,
                    }}
                  >
                    {loading && <ChartsLoadingOverlay />}
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
                    <ChartsGrid vertical horizontal />
                    <ChartsLegend
                      axisDirection="x"
                      position={{ vertical: "top", horizontal: "right" }}
                      direction="row"
                      padding={0}
                      slotProps={{
                        legend: {
                          itemMarkHeight: 3,
                          labelStyle: {
                            fontSize: 12,
                          },
                        },
                      }}
                    />
                    <LinePlot />
                    <ChartsYAxis axisId="y-axis" position="left" label="" />
                    <ChartsYAxis axisId="y-axis" position="right" label="" />

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
        <CardActions
          sx={{
            bgcolor: "highlight",
            mb: 0,
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

export default MultipleAxis;
