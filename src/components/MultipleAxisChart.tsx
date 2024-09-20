import Grid from "@mui/material/Grid";
import {
  ChartsAxisHighlight,
  ChartsGrid,
  ChartsOnAxisClickHandler,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  HighlightScope,
  LinePlot,
  LineSeriesType,
  ResponsiveChartContainerPro,
  ZoomData,
} from "@mui/x-charts-pro";
import { AxisValueFormatterContext } from "@mui/x-charts/internals";
import { useState } from "react";

interface Props {
  analogSignalNames: string[];
  analogValues_filtered: number[][];
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

const MultipleAxisChart = ({
  analogSignalNames,
  analogValues_filtered,
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
  let color_light = [
    "crimson",
    "goldenrod",
    "deepskyblue",
    "crimson",
    "goldenrod",
    "deepskyblue",
  ];
  let series: LineSeriesType[] = [];

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

  series = [];
  for (let i = 0; i < 6; i++) {
    let label = analogSignalNames[i];
    let a: LineSeriesType = {
      type: "line",
      label: label,
      data: analogValues_filtered[i],
      yAxisId: "yAxis",
      showMark: false,
      color: color_light[i],
      highlightScope: {
        highlighted: "series",
        faded: "global",
      } as HighlightScope,
    };
    series.push(a);
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
    zoom: { filterMode: "discard" },
    valueFormatter: timeFormatter,
  } as const;

  return (
    <Grid
      container
      height={`calc(100%)`}
      sx={{ padding: 0, m: 0, bgcolor: "" }}
    >
      {series.map((series, index) => (
        <Grid
          key={"multiple-" + index}
          item
          xs={12}
          height={`calc((90%)/6)`}
          sx={{ bgcolor: "" }}
        >
          <ResponsiveChartContainerPro
            xAxis={[{ ...xAxisCommon, data: timeValues }]}
            yAxis={[
              { id: "yAxis" },
              //  { zoom: true }
            ]}
            series={[series]}
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

export default MultipleAxisChart;
