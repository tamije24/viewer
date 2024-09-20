import { useState } from "react";
import Grid from "@mui/material/Grid";

import ProjectToolbar from "./ProjectToolbar";
import ProjectList from "./ProjectList";
import ProjectDetails from "./ProjectDetails";
import ProjectSettings from "./ProjectSettings";
import GeneralInfo from "./GeneralInfo";
import AnalogChannels from "./AnalogChannels";
import DigitalChannels from "./DigitalChannels";
import SingleAxis from "./SingleAxis";
import MultipleAxis from "./MultipleAxis";
import AddProject from "./AddProject";
import CursorValues from "./CursorValues";

import analogSignalService, {
  AnalogSignal,
} from "../services/analog-signal-service";
import digitalSignalService, {
  DigitalSignal,
} from "../services/digital-signal-service";
import phasorService, { Phasor } from "../services/phasor-service";
import projectService, { Project } from "../services/project-service";
import { ComtradeFile } from "../services/comtrade-file-service";
import Stack from "@mui/material/Stack";
import ChartFooter from "./ChartFooter";
import analogChannelService, {
  AnalogChannel,
} from "../services/analog-channel-service";
import ChartComponent from "./ChartComponent";

let analogSignals: AnalogSignal[][] = [];
let digitalSignals: DigitalSignal[][] = [];
let dftPhasors: Phasor[][] = [];

let analogChannelInfo: AnalogChannel[][] = [];

let analogSignalNames: string[][] = [];
let digitalSignalNames: string[][] = [];

let tableValues: {
  id: string;
  channel: string;
  unit: string;
  inst: number;
  phasor_mag: number;
  phasor_ang: number;
  true_rms: number;
  pos_peak: number;
  neg_peak: number;
}[] = [];

const emptyFile: ComtradeFile = {
  file_id: 0,
  cfg_file: "",
  dat_file: "",
  station_name: "",
  analog_channel_count: 0,
  digital_channel_count: 0,
  start_time_stamp: new Date(),
  trigger_time_stamp: new Date(),
  line_frequency: 0,
  sampling_frequency: 0,
  ia_channel: "",
  ib_channel: "",
  ic_channel: "",
  va_channel: "",
  vb_channel: "",
  vc_channel: "",
  d1_channel: "",
  d2_channel: "",
  d3_channel: "",
  d4_channel: "",
};

const emptyProject: Project = {
  project_id: 0,
  project_name: "",
  afa_case_id: "",
  line_name: "",
  no_of_terminals: 0,
  favorite: false,
  notes: "",
  user: 0,
  files: [emptyFile],
};

const MainComponent = () => {
  // const [axisClick, setAxisClick] = useState([
  //   {
  //     dataIndex: 0,
  //     axisValue: 0,
  //     timestamp: "",
  //     secondaryIndex: 0,
  //     secondaryValue: 0,
  //     secondaryTimestamp: "",
  //   },
  // ]);

  const [presentZoomValues, setPresentZoomValues] = useState([
    {
      startPercent: 0,
      endPercent: 100,
      startTime: 0,
      endTime: 0,
    },
  ]);
  const [toolTipStatus, setToolTipStatus] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project>(emptyProject);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState("ProjectList");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [navigationPages, setNavigationPages] = useState([""]);
  const [navigationHeader, setNavigationHeader] = useState("");

  const [asigLoading, setAsigLoading] = useState([false]);
  const [asigError, setAsigError] = useState([""]);

  const [dsigLoading, setDsigLoading] = useState([false]);
  const [dsigError, setDsigError] = useState([""]);

  const [phasorLoading, setPhasorLoading] = useState([false]);
  const [phasorError, setPhasorError] = useState([""]);

  const [analogChannelLoading, setAnalogChannelLoading] = useState([false]);

  let axisClick = [
    {
      dataIndex: 0,
      axisValue: 0,
      timestamp: "",
      secondaryIndex: 0,
      secondaryValue: 0,
      secondaryTimestamp: "",
    },
  ];

  const handleSelectNavItem = (pageName: string, file_index?: number) => {
    setSelectedPage(pageName);
    setSelectedIndex(file_index ? file_index : 0);

    if (file_index !== undefined && selectedProject !== null) {
      let file_id = selectedProject.files[file_index].file_id;
      setSelectedFile(file_id);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedPage("ProjectDetails");

    // Set components for toolbar
    setNavigationHeader(project.line_name);
    let navPages = [""];
    navPages.pop();
    project
      ? project.files.length !== 0
        ? project.files.map((file: ComtradeFile) =>
            navPages.push(file.station_name)
          )
        : console.log("no files")
      : console.log("no project!");
    setNavigationPages(navPages);

    // Get signals from backend
    getSignalsFromBackend(project);
  };

  // const handleDeleteProject = () => {};

  const handleAxisClick = (
    dataIndex: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => {
    // let aValue = [...axisClick];
    let newValues = {
      dataIndex: dataIndex,
      axisValue: axisValue,
      timestamp: timestamp,
      secondaryIndex: secondaryIndex,
      secondaryValue: secondaryValue,
      secondaryTimestamp: secondaryTimestamp,
    };
    selectedIndex > axisClick.length - 1
      ? axisClick.push(newValues)
      : (axisClick[selectedIndex] = newValues);

    //   if (selectedIndex <= axisClick.length) fillSideTable();
  };

  const changePresentZoomLimit = (zoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  }) => {
    let newZb = [...presentZoomValues];
    newZb[selectedIndex] = {
      startPercent: zoomValues.startPercent,
      endPercent: zoomValues.endPercent,
      startTime: zoomValues.startTime,
      endTime: zoomValues.endTime,
    };
    setPresentZoomValues(newZb);
  };

  const handleZoomOutClick = () => {
    let minTime = 0;
    let maxTime = 0;
    if (analogSignals[selectedIndex] !== undefined) {
      let L = analogSignals[selectedIndex].length;
      minTime = Object.values(analogSignals[selectedIndex][0])[0];
      maxTime = Object.values(analogSignals[selectedIndex][L - 1])[0];
    }
    let newZb = [...zoomBoundary];
    newZb[selectedIndex] = {
      startPercent: 0,
      endPercent: 100,
      startTime: minTime,
      endTime: maxTime,
    };
    setZoomBoundary(newZb);
  };

  const handleZoomInClick = (fromValue: number, toValue: number) => {
    let duration = 0;
    let minTime = 0;
    if (analogSignals[selectedIndex] !== undefined) {
      let L = analogSignals[selectedIndex].length;
      let maxTime = Object.values(analogSignals[selectedIndex][L - 1])[0];
      minTime = Object.values(analogSignals[selectedIndex][0])[0];
      duration = maxTime - minTime;
    }
    let newZb = [...zoomBoundary];
    newZb[selectedIndex] = {
      startPercent:
        duration !== 0 ? ((fromValue - minTime) / duration) * 100 : 0,
      endPercent: duration !== 0 ? ((toValue - minTime) / duration) * 100 : 0,
      startTime: fromValue,
      endTime: toValue,
    };
    setZoomBoundary(newZb);
  };

  const handleZoomChange = (fromValue: number, toValue: number) => {
    let newZb = [...zoomBoundary];
    newZb[selectedIndex] = {
      startPercent: fromValue,
      endPercent: toValue,
      startTime: fromValue,
      endTime: toValue,
    };
    setZoomBoundary(newZb);
  };

  const handleTooltipChange = (toolTipStatus: boolean) => {
    setToolTipStatus(toolTipStatus);
  };

  const fillSideTable = () => {
    if (axisClick[selectedIndex] === undefined) {
      tableValues = [];
      return;
    }

    let dataIndex = axisClick[selectedIndex].dataIndex;
    let secondaryIndex = axisClick[selectedIndex].secondaryIndex;

    // reset table values
    tableValues = [];

    // Set table values to be displayed
    let names: string[] = [];
    if (analogSignalNames[selectedIndex] !== undefined) {
      names = [...analogSignalNames[selectedIndex]];
    } else {
      return;
    }

    let units: string[] = [];
    if (analogChannelInfo[selectedIndex] !== undefined && names.length > 0) {
      names.forEach((channel) => {
        analogChannelInfo[selectedIndex].forEach((ac) => {
          ac.channel_name === channel ? units.push(ac.unit) : "";
        });
      });
    } else {
      return;
    }

    let sample_values =
      analogSignals[selectedIndex] !== undefined
        ? Object.values(analogSignals[selectedIndex][dataIndex])
        : new Array(analogSignals.length).fill(0);

    let phasor_values =
      dftPhasors[selectedIndex] !== undefined
        ? Object.values(dftPhasors[selectedIndex][dataIndex])
        : new Array((analogSignals.length - 1) * 2).fill(0);

    // get range of values between primary and secondary cursors
    const arrayColumn = (arr: number[][], n: number) => arr.map((x) => x[n]);

    let ind: { start: number; end: number } =
      dataIndex > secondaryIndex
        ? { start: secondaryIndex, end: dataIndex }
        : { start: dataIndex, end: secondaryIndex };

    const a_sig = [];
    for (let i = ind.start; i < ind.end; i++) {
      let value = Object.values(analogSignals[selectedIndex][i]);
      a_sig.push(value);
    }

    // indexes for rms
    let fs = selectedProject.files[selectedIndex].sampling_frequency;
    let N = Math.round(fs / 50);
    let end_rms = dataIndex;
    let start_rms = dataIndex > N ? dataIndex - N + 1 : 0;
    const a_sig_rms = [];
    for (let i = start_rms; i < end_rms + 1; i++) {
      let value = Object.values(analogSignals[selectedIndex][i]);
      a_sig_rms.push(value);
    }

    let id = ["IA", "IB", "IC", "VA", "VB", "VC"];
    for (let i = 0; i < names.length; i++) {
      let label = names[i];
      let unit = units[i];
      let positivePeak =
        a_sig.length > 0 ? Math.max(...arrayColumn(a_sig, i + 1)) : 0;
      let negativePeak =
        a_sig.length > 0 ? Math.min(...arrayColumn(a_sig, i + 1)) : 0;

      let rowValue = {
        id: id[i],
        channel: label,
        unit: unit,
        inst: sample_values[i + 1],
        phasor_mag: phasor_values[2 * i],
        phasor_ang: phasor_values[2 * i + 1],
        true_rms: calculateRMS([...arrayColumn(a_sig_rms, i + 1)]),
        pos_peak: positivePeak,
        neg_peak: negativePeak,
      };
      tableValues.push(rowValue);
    }
  };

  const calculateRMS = (values: number[]) => {
    let N = values.length;

    // squaring values
    let rmsValue = 0;
    for (let i = 0; i < N; i++) {
      rmsValue = rmsValue + values[i] * values[i];
    }

    // root and mean
    rmsValue = Math.sqrt(rmsValue / N);

    return rmsValue;
  };

  const getSignalsFromBackend = (project: Project) => {
    console.log("getting signals from backend");

    // get analog signals
    getAnalogSignals(project);

    // get digital signals
    getDigitalSignals(project);

    // get phasors
    getPhasors(project);

    // get harmonics

    // get analog channel information
    getAnalogChannels(project);
  };

  const getAnalogSignals = (project: Project) => {
    // reset all data
    analogSignals = [];
    analogSignalNames = [];

    // get analog signals from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...asigLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setAsigLoading(a);

        analogSignalService
          .getAllAnalogSignals(file_id)
          .then((res) => {
            let sig_names = [
              project.files[i].ia_channel,
              project.files[i].ib_channel,
              project.files[i].ic_channel,
              project.files[i].va_channel,
              project.files[i].vb_channel,
              project.files[i].vc_channel,
            ];
            analogSignals.push(res.data);
            analogSignalNames.push([...sig_names]);

            a = [...asigLoading];
            a[i] = false;
            setAsigLoading(a);
          })
          .catch((err) => {
            if (err instanceof TypeError) return;
            let e = [...asigError];
            e[i] = err.message;
            setAsigError(e);

            a = [...asigLoading];
            a[i] = false;
            setAsigLoading(a);
            console.log("Error .. i .. ", asigError);
          });
      }
    }
  };

  const getDigitalSignals = (project: Project) => {
    // reset all data
    digitalSignals = [];
    digitalSignalNames = [];

    // get digital signals from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...dsigLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setDsigLoading(a);

        digitalSignalService
          .getAllDigitalSignals(file_id)
          .then((res) => {
            let sig_names = [
              project.files[i].d1_channel,
              project.files[i].d2_channel,
              project.files[i].d3_channel,
              project.files[i].d4_channel,
            ];

            digitalSignals.push(res.data);
            digitalSignalNames.push([...sig_names]);

            a = [...dsigLoading];
            a[i] = false;
            setDsigLoading(a);
          })
          .catch((err) => {
            if (err instanceof TypeError) return;
            let e = [...dsigError];
            e[i] = err.message;
            setDsigError(e);

            a = [...dsigLoading];
            a[i] = false;
            setDsigLoading(a);
            console.log("Error .. i .. ", dsigError);
          });
      }
    }
  };

  const getPhasors = (project: Project) => {
    // reset all data
    dftPhasors = [];
    // get phasors from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...phasorLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setPhasorLoading(a);

        phasorService
          .getAllAPhasors(file_id)
          .then((res) => {
            if (dftPhasors.length >= i + 1) {
              dftPhasors[i] = JSON.parse(String(res.data)).phasors;
            } else {
              dftPhasors.push(JSON.parse(String(res.data)).phasors);
            }
            a = [...phasorLoading];
            a[i] = false;
            setPhasorLoading(a);
          })
          .catch((err) => {
            if (err instanceof TypeError) return;
            let e = [...dsigError];
            e[i] = err.message;
            setPhasorError(e);

            a = [...phasorLoading];
            a[i] = false;
            setPhasorLoading(a);
            console.log("Error .. i .. ", phasorError);
          });
      }
    }
  };

  const getAnalogChannels = (project: Project) => {
    // reset all data
    analogChannelInfo = [];

    // get analog channel information from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...analogChannelLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setAnalogChannelLoading(a);

        analogChannelService
          .getAllAnalogChannels(file_id)
          .then((res) => {
            analogChannelInfo.push(res.data);
            a = [...analogChannelLoading];
            a[i] = false;
            setAnalogChannelLoading(a);
          })
          .catch((err) => {
            console.log(err.message);
            a = [...analogChannelLoading];
            a[i] = false;
            setAnalogChannelLoading(a);
          });
      }
    }
  };

  const handleAddFiles = () => {
    projectService
      .getProject(selectedProject ? selectedProject.project_id : 0)
      .then((res) => {
        handleSelectProject(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  if (selectedIndex <= axisClick.length) fillSideTable();

  return (
    <Grid
      container
      direction="row"
      spacing={0.5}
      sx={{
        justifyContent: "flex-start",
        backgroundColor: "Window-frame",
        overflow: "hidden",
      }}
    >
      <Grid
        item
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? "#DDDDDD" : "#323232",
        }}
      >
        <ProjectToolbar
          navigationHeader={navigationHeader}
          navigationPages={navigationPages}
          onSelectNavItem={handleSelectNavItem}
        />
      </Grid>
      {/* {selectedPage === "SingleAxis" || selectedPage === "MultipleAxis" ? (
        <Grid item xs>
          <Grid container>
            <Grid item xs={9}>
              <Stack>
                {selectedPage === "SingleAxis" && (
                  <SingleAxis
                    stationName={
                      selectedProject.files[selectedIndex].station_name
                    }
                    analogSignals={analogSignals[selectedIndex]}
                    analogSignalNames={analogSignalNames[selectedIndex]}
                    digitalSignals={digitalSignals[selectedIndex]}
                    digitalSignalNames={digitalSignalNames[selectedIndex]}
                    // start_time_stamp={
                    //   selectedProject.files[selectedIndex].start_time_stamp
                    // }
                    // trigger_time_stamp={
                    //   selectedProject.files[selectedIndex].trigger_time_stamp
                    // }
                    error={asigError[selectedIndex]}
                    isLoading={asigLoading[selectedIndex]}
                    cursorValues={
                      axisClick.length >= selectedIndex + 1
                        ? {
                            primary: axisClick[selectedIndex].dataIndex,
                            primaryTime: axisClick[selectedIndex].axisValue,
                            primaryTimestamp:
                              axisClick[selectedIndex].timestamp,
                            secondary: axisClick[selectedIndex].secondaryIndex,
                            secondaryTime:
                              axisClick[selectedIndex].secondaryValue,
                            secondaryTimestamp:
                              axisClick[selectedIndex].secondaryTimestamp,
                          }
                        : {
                            primary: 0,
                            primaryTime: 0,
                            primaryTimestamp: "",
                            secondary: 0,
                            secondaryTime: 0,
                            secondaryTimestamp: "",
                          }
                    }
                    onAxisClick={handleAxisClick}
                    zoomBoundary={
                      zoomBoundary.length >= selectedIndex + 1
                        ? {
                            startPercent:
                              zoomBoundary[selectedIndex].startPercent,
                            endPercent: zoomBoundary[selectedIndex].endPercent,
                          }
                        : {
                            startPercent: 0,
                            endPercent: 100,
                          }
                    }
                    toolTipStatus={toolTipStatus}
                  />
                )}

                {selectedPage === "MultipleAxis" && (
                  <MultipleAxis
                    stationName={
                      selectedProject.files[selectedIndex].station_name
                    }
                    analogSignals={analogSignals[selectedIndex]}
                    analogSignalNames={analogSignalNames[selectedIndex]}
                    error={asigError[selectedIndex]}
                    isLoading={asigLoading[selectedIndex]}
                    cursorValues={
                      axisClick.length >= selectedIndex + 1
                        ? {
                            primary: axisClick[selectedIndex].dataIndex,
                            primaryTime: axisClick[selectedIndex].axisValue,
                            primaryTimestamp:
                              axisClick[selectedIndex].timestamp,
                            secondary: axisClick[selectedIndex].secondaryIndex,
                            secondaryTime:
                              axisClick[selectedIndex].secondaryValue,
                            secondaryTimestamp:
                              axisClick[selectedIndex].secondaryTimestamp,
                          }
                        : {
                            primary: 0,
                            primaryTime: 0,
                            primaryTimestamp: "",
                            secondary: 0,
                            secondaryTime: 0,
                            secondaryTimestamp: "",
                          }
                    }
                    onAxisClick={handleAxisClick}
                    zoomBoundary={
                      zoomBoundary.length >= selectedIndex + 1
                        ? {
                            startPercent:
                              zoomBoundary[selectedIndex].startPercent,
                            endPercent: zoomBoundary[selectedIndex].endPercent,
                          }
                        : {
                            startPercent: 15,
                            endPercent: 30,
                          }
                    }
                    toolTipStatus={toolTipStatus}
                  />
                )}
                <ChartFooter
                  timeRange={{ minTime: -0.1, maxTime: 0.8 }}
                  zoomBoundary={
                    zoomBoundary.length >= selectedIndex + 1
                      ? {
                          startPercent:
                            zoomBoundary[selectedIndex].startPercent,
                          endPercent: zoomBoundary[selectedIndex].endPercent,
                        }
                      : {
                          startPercent: 0,
                          endPercent: 0,
                        }
                  }
                  onZoomOutClick={handleZoomOutClick}
                  onZoomInClick={handleZoomInClick}
                  onZoomChange={handleZoomChange}
                  onToolTipStatusChange={handleTooltipChange}
                />
              </Stack>
            </Grid>

            <Grid item xs={3}>
              <CursorValues
                axisClick={
                  selectedIndex <= axisClick.length - 1
                    ? axisClick[selectedIndex]
                    : {
                        dataIndex: 0,
                        axisValue: 0,
                        timestamp: "",
                        secondaryIndex: 0,
                        secondaryValue: 0,
                        secondaryTimestamp: "",
                      }
                }
                tableValues={tableValues}
              />
            </Grid>
          </Grid>
        </Grid>
      ) : ( */}
      <Grid item sx={{ width: `calc(100% - 270px)` }}>
        {(selectedPage === "SingleAxis" || selectedPage === "MultipleAxis") && (
          <ChartComponent
            stationName={selectedProject.files[selectedIndex].station_name}
            plotName={selectedPage}
            analogSignals={analogSignals[selectedIndex]}
            analogSignalNames={analogSignalNames[selectedIndex]}
            digitalSignals={digitalSignals[selectedIndex]}
            digitalSignalNames={digitalSignalNames[selectedIndex]}
            error={asigError[selectedIndex]}
            isAnLoading={asigLoading[selectedIndex]}
            isDigLoading={dsigLoading[selectedIndex]}
            passedZoomValues={
              presentZoomValues.length >= selectedIndex + 1
                ? {
                    startPercent: presentZoomValues[selectedIndex].startPercent,
                    endPercent: presentZoomValues[selectedIndex].endPercent,
                    startTime: presentZoomValues[selectedIndex].startTime,
                    endTime: presentZoomValues[selectedIndex].endTime,
                  }
                : {
                    startPercent: 0,
                    endPercent: 100,
                    startTime: 0,
                    endTime: 0,
                  }
            }
            changePresentZoomLimit={changePresentZoomLimit}
            cursorValues={
              axisClick.length >= selectedIndex + 1
                ? {
                    primary: axisClick[selectedIndex].dataIndex,
                    primaryTime: axisClick[selectedIndex].axisValue,
                    primaryTimestamp: axisClick[selectedIndex].timestamp,
                    secondary: axisClick[selectedIndex].secondaryIndex,
                    secondaryTime: axisClick[selectedIndex].secondaryValue,
                    secondaryTimestamp:
                      axisClick[selectedIndex].secondaryTimestamp,
                  }
                : {
                    primary: 0,
                    primaryTime: 0,
                    primaryTimestamp: "",
                    secondary: 0,
                    secondaryTime: 0,
                    secondaryTimestamp: "",
                  }
            }
            onAxisClick={handleAxisClick}
            analogChannelInfo={analogChannelInfo[selectedIndex]}
            dftPhasors={dftPhasors[selectedIndex]}
            sampling_frequency={
              selectedProject.files[selectedIndex].sampling_frequency
            }
          />
        )}
        {selectedPage === "ProjectList" && (
          <ProjectList
            onSelectProject={handleSelectProject}
            onAddProject={() => {
              setSelectedPage("AddProject");
            }}
          />
        )}
        {selectedPage === "AddProject" && (
          <AddProject onAddProject={handleSelectProject} />
        )}
        {selectedPage === "ProjectDetails" && (
          <ProjectDetails
            project={selectedProject}
            onAddFiles={handleAddFiles}
          />
        )}
        {selectedPage === "ProjectSettings" && (
          <ProjectSettings project={selectedProject} />
        )}
        {selectedPage === "GeneralInfo" && (
          <GeneralInfo
            file_id={selectedFile}
            project_id={selectedProject ? selectedProject.project_id : 0}
          />
        )}
        {selectedPage === "AnalogChannels" && (
          <AnalogChannels
            station_name={selectedProject.files[selectedIndex].station_name}
            analogChannels={analogChannelInfo[selectedIndex]}
          />
        )}
        {selectedPage === "DigitalChannels" && (
          <DigitalChannels
            station_name={selectedProject.files[selectedIndex].station_name}
            file_id={selectedFile ? selectedFile : 0}
          />
        )}
      </Grid>
      {/* )} */}
    </Grid>
  );
};

export default MainComponent;
