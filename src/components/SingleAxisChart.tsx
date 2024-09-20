import { useState } from "react";

import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import {
  AreaPlot,
  ChartsAxisHighlight,
  ChartsGrid,
  ChartsLegend,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  LinePlot,
  ZoomData,
} from "@mui/x-charts-pro";
import { ResponsiveChartContainerPro } from "@mui/x-charts-pro/ResponsiveChartContainerPro";
import { HighlightScope } from "@mui/x-charts/context/HighlightedProvider";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";
import { LineSeriesType } from "@mui/x-charts/models/seriesType";

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
}: Props) => {
  // STATE VARIABLES
  const [zoom, setZoom] = useState<ZoomData[]>([
    {
      axisId: "time-axis",
      start: presentZoomValues.startPercent,
      end: presentZoomValues.endPercent,
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

  // OTHER VARIABLES
  let current_series: LineSeriesType[] = [];
  let voltage_series: LineSeriesType[] = [];
  let digital_series: LineSeriesType[] = [];

  let color_light = ["crimson", "goldenrod", "deepskyblue"];

  // EVENT HANDLERS
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
        primaryCursor.cursorReduced,
        primaryCursor.time,
        primaryCursor.timestamp,
        originalIndexes[dataIndex],
        dataIndex,
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

  let baseline = [0, 1.5, 3, 4.5];
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

  if (
    zoom[0].start !== presentZoomValues.startPercent ||
    zoom[0].end !== presentZoomValues.endPercent
  ) {
    setZoom([
      {
        axisId: "time-axis",
        start: presentZoomValues.startPercent,
        end: presentZoomValues.endPercent,
      },
    ]);
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

  const xAxisCommon = {
    id: "time-axis",
    scaleType: "point",
    // zoom: { filterMode: "discard" },
    valueFormatter: timeFormatter,
  } as const;

  return (
    <Grid
      container
      height={`calc(100%)`}
      sx={{ padding: 0, m: 0, bgcolor: "" }}
    >
      <Grid
        item
        xs={12}
        key="current_chart"
        sx={{ height: `calc((100vh - 50px)*0.3`, border: 1 }}
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
          margin={{ left: 0, right: 0, top: 30, bottom: 0 }}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 1.5,
            },
            border: 0.5,
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
          <LinePlot />
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
        </ResponsiveChartContainerPro>
      </Grid>

      <Grid
        item
        xs={12}
        key="voltage_chart"
        sx={{ height: `calc((100vh - 50px)*0.3` }}
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
          margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 1.5,
            },
            border: 0.5,
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
          <LinePlot />
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
        </ResponsiveChartContainerPro>
      </Grid>

      <Grid item xs={12} sx={{ height: `calc((100vh - 50px)*0.3` }}>
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
            top: 0,
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
          <ChartsOnAxisClickHandler
            onAxisClick={(event, data) => {
              handleAxisClick(
                event,
                data ? data.dataIndex : 0,
                data ? Number(data.axisValue ? data.axisValue : 0) : 0
              );
            }}
          />
          <AreaPlot />
          <LinePlot />
          <ChartsAxisHighlight />
          <ChartsLegend
            axisDirection="x"
            position={{ vertical: "bottom", horizontal: "right" }}
            direction="row"
            sx={{ mr: 5 }}
            padding={10}
            slotProps={{
              legend: {
                itemMarkHeight: 5,
                labelStyle: {
                  fontSize: 10,
                },
              },
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
        </ResponsiveChartContainerPro>
      </Grid>

      <Grid
        key={"single-timeaxis"}
        item
        xs={12}
        height="50px"
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
  );
};

export default SingleAxisChart;
