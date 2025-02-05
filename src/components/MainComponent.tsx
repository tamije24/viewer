import { useState } from "react";

import Grid from "@mui/material/Grid";

// Our Components
import AddProject from "./AddProject";
import AnalogChannels from "./AnalogChannels";
import ChartComponent from "./ChartComponent";
import DigitalChannels from "./DigitalChannels";
import GeneralInfo from "./GeneralInfo";
import MergeView from "./MergeView";
import ProjectDetails from "./ProjectDetails";
import ProjectList from "./ProjectList";
import ProjectSettings from "./ProjectSettings";
import ProjectToolbar from "./ProjectToolbar";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

// Our Services
import analogSignalService from "../services/analog-signal-service";
import digitalSignalService from "../services/digital-signal-service";
import phasorService from "../services/phasor-service";
import projectService, { Project } from "../services/project-service";
import { ComtradeFile } from "../services/comtrade-file-service";
import analogChannelService, {
  AnalogChannel,
} from "../services/analog-channel-service";

import { GridRowSelectionModel } from "@mui/x-data-grid-pro";
import resampleService from "../services/resample-service";
import Button from "@mui/material/Button";

let analogSignals: number[][][] = [];
let digitalSignals: number[][][] = [];
let timeValues: number[][] = [];
let timeStamps: string[][] = [];
let dftPhasors: number[][][] = [];
let analogChannelInfo: AnalogChannel[][] = [];
let analogSignalNames: string[][] = [];
let digitalSignalNames: string[][] = [];
let digitalChannelCount: number[] = [];

let merge_type: string = "";
let sampling_frequency_merged: number = 0;
let timeValues_tomerge: number[][] = [];
let timeStamps_tomerge: string[][] = [];
let analogSignals_tomerge: number[][][] = [];
let digitalSignals_tomerge: number[][][] = [];
let dftPhasors_tomerge: number[][][] = [];

let resampleDone: boolean[] = [];
let analogDataReceived: boolean[] = [];
let digitalDataReceived: boolean[] = [];
let phasorDataReceived: boolean[] = [];

let selectedIndex = 0;
let tempRowSelectionModel: GridRowSelectionModel[] = [];
let tempDigitalRowSelectionModel: GridRowSelectionModel[] = [];

let merged_files: number[] = [];
// let tempAxisClick = [
//   {
//     dataIndex: 0,
//     dataIndexReduced: 0,
//     axisValue: 0,
//     timestamp: "",
//     secondaryIndex: 0,
//     secondaryIndexReduced: 0,
//     secondaryValue: 0,
//     secondaryTimestamp: "",
//   },
// ];

//let rowSelectionModel: GridRowSelectionModel[];

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
  resampled_frequency: 0,
  ia_channel: "",
  ib_channel: "",
  ic_channel: "",
  in_channel: "",
  va_channel: "",
  vb_channel: "",
  vc_channel: "",
  d1_channel: "",
  d2_channel: "",
  d3_channel: "",
  d4_channel: "",
  d5_channel: "",
  d6_channel: "",
  d7_channel: "",
  d8_channel: "",
  d9_channel: "",
  d10_channel: "",
  d11_channel: "",
  d12_channel: "",
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

interface Props {
  pointCount: number;
  navbarStatus: boolean;
  sidebarStatus: boolean;
  tooltipStatus: boolean;
}

const MainComponent = ({
  pointCount,
  navbarStatus,
  sidebarStatus,
  tooltipStatus,
}: Props) => {
  const [presentZoomValues, setPresentZoomValues] = useState([
    {
      startPercent: 0,
      endPercent: 100,
      startTime: 0,
      endTime: 0,
    },
  ]);

  // let axisClick = [
  //   {
  //     dataIndex: 0,
  //     dataIndexReduced: 0,
  //     axisValue: 0,
  //     timestamp: "",
  //     secondaryIndex: 0,
  //     secondaryIndexReduced: 0,
  //     secondaryValue: 0,
  //     secondaryTimestamp: "",
  //   },
  // ];

  // const [axisClicked, setAxisClicked] = useState(false);

  const [axisClick, setAxisClick] = useState([
    {
      dataIndex: 0,
      dataIndexReduced: 0,
      axisValue: 0,
      timestamp: "",
      secondaryIndex: 0,
      secondaryIndexReduced: 0,
      secondaryValue: 0,
      secondaryTimestamp: "",
    },
  ]);

  const [rowSelectionModel, setRowSelectionModel] = useState<
    GridRowSelectionModel[]
  >([]);

  const [digitalRowSelectionModel, setDigitalRowSelectionModel] = useState<
    GridRowSelectionModel[]
  >([]);

  const [selectedProject, setSelectedProject] = useState<Project>(emptyProject);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState("ProjectList");
  //const [selectedIndex, setSelectedIndex] = useState(0);

  const [mergeViewEnabled, setMergeViewEnabled] = useState(false);
  const [selectedMergeType, setSelectedMergeType] = useState("");
  const [mergeError, setMergeError] = useState(false);
  const [mergeErrorMessage, setMergeErrorMessage] = useState("");

  const [resampleLoading, setResampleLoading] = useState(false);
  const [resampleMessage, setResampleMessage] = useState("");

  const [navigationPages, setNavigationPages] = useState([""]);
  const [navigationHeader, setNavigationHeader] = useState("");

  const [asigLoading, setAsigLoading] = useState([false]);
  const [asigError, setAsigError] = useState([""]);

  const [dsigLoading, setDsigLoading] = useState([false]);
  const [dsigError, setDsigError] = useState([""]);

  const [phasorLoading, setPhasorLoading] = useState([false]);
  const [phasorError, setPhasorError] = useState([""]);

  const [analogChannelLoading, setAnalogChannelLoading] = useState([false]);

  const handleSelectNavItem = (pageName: string, file_index?: number) => {
    setSelectedPage(pageName);

    if (pageName === "MergeSingleView" || pageName === "MergeMultipleView") {
      //setSelectedIndex(selectedProject.files.length);
      selectedIndex = selectedProject.files.length;
    } else {
      // setSelectedIndex(file_index ? file_index : 0);
      selectedIndex = file_index ? file_index : 0;
    }

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

    // Reset merge view type
    setSelectedMergeType("");
    // Get signals from backend
    getSignalsFromBackend(project);
  };

  // const handleDeleteProject = () => {};

  const handleAxisClick = (
    dataIndex: number,
    dataIndexReduced: number,
    axisValue: number,
    timestamp: string,
    secondaryIndex: number,
    secondaryIndexReduced: number,
    secondaryValue: number,
    secondaryTimestamp: string
  ) => {
    let aValue = [...axisClick];

    aValue[selectedIndex] = {
      dataIndex: dataIndex,
      dataIndexReduced: dataIndexReduced,
      axisValue: axisValue,
      timestamp: timestamp,
      secondaryIndex: secondaryIndex,
      secondaryIndexReduced: secondaryIndexReduced,
      secondaryValue: secondaryValue,
      secondaryTimestamp: secondaryTimestamp,
    };
    setAxisClick(aValue);

    // axisClick[selectedIndex] = {
    //   dataIndex: dataIndex,
    //   dataIndexReduced: dataIndexReduced,
    //   axisValue: axisValue,
    //   timestamp: timestamp,
    //   secondaryIndex: secondaryIndex,
    //   secondaryIndexReduced: secondaryIndexReduced,
    //   secondaryValue: secondaryValue,
    //   secondaryTimestamp: secondaryTimestamp,
    // };
  };

  const handleAnalogModelChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    if (tempRowSelectionModel[selectedIndex] !== newRowSelectionModel) {
      tempRowSelectionModel[selectedIndex] = newRowSelectionModel;
      setRowSelectionModel([...tempRowSelectionModel]);
    }
  };

  const handleDigitalModelChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    if (
      tempDigitalRowSelectionModel[selectedIndex] !== newRowSelectionModel &&
      newRowSelectionModel.length !== 0
    ) {
      tempDigitalRowSelectionModel[selectedIndex] = newRowSelectionModel;
      setDigitalRowSelectionModel([...tempDigitalRowSelectionModel]);
    }
  };

  // HELPER FUNCTIONS
  const arrayColumn = (arr: number[][], n: number) => arr.map((x) => x[n]);
  const strArrayColumn = (arr: string[][], n: number) => arr.map((x) => x[n]);

  const changePresentZoomLimit = (zoomValues: {
    startPercent: number;
    endPercent: number;
    startTime: number;
    endTime: number;
  }) => {
    let newZb = [...presentZoomValues];

    // for (let i = 0; i < selectedIndex; i++) {
    //   if (newZb[selectedIndex] === undefined) {
    //     newZb[i] = {
    //       startPercent: 0,
    //       endPercent: 100,
    //       startTime: 0,
    //       endTime: 100,
    //     };
    //   }
    // }
    newZb[selectedIndex] = {
      startPercent: zoomValues.startPercent,
      endPercent: zoomValues.endPercent,
      startTime: zoomValues.startTime,
      endTime: zoomValues.endTime,
    };

    setPresentZoomValues(newZb);
  };

  const getSignalsFromBackend = (project: Project) => {
    console.log("getting signals from backend");

    // get analog channel information
    getAnalogChannels(project);

    // get analog signals
    getAnalogSignals(project);

    // get digital signals
    getDigitalSignals(project);

    // get phasors
    getPhasors(project);
  };

  const getAnalogSignals = (project: Project) => {
    // reset all data
    timeValues = [];
    timeStamps = [];
    analogSignals = [];
    analogSignalNames = [];
    //    let newRowSelectionModel: GridRowSelectionModel[] = [];

    tempRowSelectionModel = [];
    for (let i = 0; i < project.files.length; i++) {
      timeValues.push([]);
      timeStamps.push([]);
      analogSignals.push([]);
      analogSignalNames.push([]);
      tempRowSelectionModel.push([]);
    }
    // add one more row for merge view
    tempRowSelectionModel.push([]);

    // get analog signals from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...asigLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setAsigLoading(a);

        analogSignalService
          .getAllAnalogSignals(file_id, 1)
          .then((res) => {
            // check which file has returned
            let results = JSON.parse(String(res.data));
            let m = 0;
            let returned_fileid = results.file;

            for (let k = 0; k < project.files.length; k++) {
              if (returned_fileid === project.files[k].file_id) m = k;
            }
            let sig_names = [
              project.files[m].ia_channel,
              project.files[m].ib_channel,
              project.files[m].ic_channel,
              project.files[m].in_channel,
              project.files[m].va_channel,
              project.files[m].vb_channel,
              project.files[m].vc_channel,
            ];
            analogSignalNames[m] = [...sig_names];

            const analogSignals_split: any[] = [];
            let L = results.signals.length;
            for (let i = 0; i < L; i++) {
              let value = Object.values(results.signals[i]);
              analogSignals_split.push(value);
            }

            timeValues[m] = [];
            timeValues[m] = arrayColumn(analogSignals_split, 7);
            timeStamps[m] = [];
            timeStamps[m] = strArrayColumn(analogSignals_split, 8);

            analogSignals[m] = [];
            for (let i = 0; i < 7; i++) {
              analogSignals[m].push(arrayColumn(analogSignals_split, i));
            }

            let n = m + 1;
            tempRowSelectionModel[m] = [
              "IA-" + n,
              "IB-" + n,
              "IC-" + n,
              "IN-" + n,
              "VA-" + n,
              "VB-" + n,
              "VC-" + n,
            ];

            setRowSelectionModel([...tempRowSelectionModel]);

            a = [...asigLoading];
            a[m] = false;
            setAsigLoading(a);

            setMergeViewEnabled(checkIfMergeViewPossible(project.files.length));
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
    digitalChannelCount = [];

    tempDigitalRowSelectionModel = [];
    for (let i = 0; i < project.files.length; i++) {
      digitalSignals.push([]);
      digitalSignalNames.push([]);
      tempDigitalRowSelectionModel.push([]);
      digitalChannelCount.push(0);
    }
    // add one more row for merge view
    tempDigitalRowSelectionModel.push([]);

    // get digital signals from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...dsigLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setDsigLoading(a);

        digitalSignalService
          .getAllDigitalSignals(file_id, 1)
          .then((res) => {
            // check which file has returned
            let results = JSON.parse(String(res.data));
            let m = 0;
            let returned_fileid = results.file;

            for (let k = 0; k < project.files.length; k++) {
              if (returned_fileid === project.files[k].file_id) m = k;
            }
            let sig_names = [
              project.files[m].d1_channel,
              project.files[m].d2_channel,
              project.files[m].d3_channel,
              project.files[m].d4_channel,
              project.files[m].d5_channel,
              project.files[m].d6_channel,
              project.files[m].d7_channel,
              project.files[m].d8_channel,
              project.files[m].d9_channel,
              project.files[m].d10_channel,
              project.files[m].d11_channel,
              project.files[m].d12_channel,
            ];

            digitalSignalNames[m] = [];
            for (let i = 0; i < sig_names.length; i++) {
              if (sig_names[i] !== "") digitalSignalNames[m].push(sig_names[i]);
            }
            // digitalSignalNames[m] = [...sig_names];

            const digitalSignals_split: any[] = [];
            let L = results.signals.length;
            //let factor = 0.3;
            for (let i = 0; i < L; i++) {
              let value = Object.values(results.signals[i]);
              for (let j = 0; j < value.length; j++) {
                //value[j] = factor * Number(value[j]) + j + factor;
                value[j] = Number(value[j]);
              }
              digitalSignals_split.push(value);
            }

            digitalSignals[m] = [];
            for (let i = 0; i < digitalSignals_split[0].length; i++) {
              if (sig_names[i] !== "")
                digitalSignals[m].push(arrayColumn(digitalSignals_split, i));
            }

            let n = m + 1;
            let temp = [];
            for (let i = 1; i <= digitalSignalNames[m].length; i++) {
              temp.push("D" + i + "-" + n);
            }
            //     let tempFull = [...digitalRowSelectionModel];
            let tempRow: GridRowSelectionModel = temp;
            tempDigitalRowSelectionModel[m] = tempRow;
            setDigitalRowSelectionModel([...tempDigitalRowSelectionModel]);

            digitalChannelCount[m] = digitalSignalNames[m].length;

            a = [...dsigLoading];
            a[m] = false;
            setDsigLoading(a);

            setMergeViewEnabled(checkIfMergeViewPossible(project.files.length));
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
    let phLoading: boolean[] = [];
    for (let i = 0; i < project.files.length; i++) {
      dftPhasors.push([]);
      phLoading.push(true);
    }

    // get phasors from backend
    if (project !== null && project.files.length !== 0) {
      for (let i = 0; i < project.files.length; i++) {
        let file_id = project.files[i].file_id;
        let a = [...phasorLoading];
        a.length >= i + 1 ? (a[i] = true) : a.push(true);
        setPhasorLoading(a);

        phasorService
          .getAllAPhasors(file_id, 1)
          .then((res) => {
            let results = JSON.parse(String(res.data));
            let m = 0;
            let returned_fileid = results.file;
            for (let k = 0; k < project.files.length; k++) {
              if (returned_fileid === project.files[k].file_id) m = k;
            }

            const phasors_split: any[] = [];
            let L = results.phasors.length;
            for (let i = 0; i < L; i++) {
              let value = Object.values(results.phasors[i]);
              phasors_split.push(value);
            }

            dftPhasors[m] = [];
            for (let i = 0; i < 14; i++) {
              dftPhasors[m].push(arrayColumn(phasors_split, i));
            }

            phLoading[m] = false;
            setPhasorLoading(phLoading);
            setMergeViewEnabled(checkIfMergeViewPossible(project.files.length));
          })
          .catch((err) => {
            if (err instanceof TypeError) return;
            let e = [...phasorError];
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
    for (let i = 0; i < project.files.length; i++) {
      analogChannelInfo.push([]);
    }

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
            // decide which file from name of channel id - before
            let m = 0;
            for (let k = 0; k < project.files.length; k++) {
              let returned_fileid = res.data[0].file;
              if (returned_fileid === project.files[k].file_id) m = k;
            }
            analogChannelInfo[m] = res.data;
            a = [...analogChannelLoading];
            a[m] = false;
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

  const checkIfMergeViewPossible = (fileCount: number) => {
    for (let i = 0; i < fileCount; i++) {
      if (analogSignals[i].length === 0) return false;
      if (digitalSignals[i].length === 0) return false;
      if (dftPhasors[i].length === 0) return false;
    }
    return true;
  };

  const handleMerging = (newMergeType: string) => {
    merge_type = newMergeType;

    let file_count = selectedProject.files.length;

    analogSignals[file_count] === undefined
      ? analogSignals.push([])
      : (analogSignals[file_count] = []);
    digitalSignals[file_count] === undefined
      ? digitalSignals.push([])
      : (digitalSignals[file_count] = []);

    timeValues[file_count] === undefined
      ? timeValues.push([])
      : (timeValues[file_count] = []);
    timeStamps[file_count] === undefined
      ? timeStamps.push([])
      : (timeStamps[file_count] = []);
    analogChannelInfo[file_count] === undefined
      ? analogChannelInfo.push([])
      : (analogChannelInfo[file_count] = []);
    analogSignalNames[file_count] === undefined
      ? analogSignalNames.push([])
      : (analogSignalNames[file_count] = []);
    digitalSignalNames[file_count] === undefined
      ? digitalSignalNames.push([])
      : (digitalSignalNames[file_count] = []);

    dftPhasors[file_count] === undefined
      ? dftPhasors.push([])
      : (dftPhasors[file_count] = []);

    let sampling_frequencies = [];
    merged_files = [];
    for (let i = 0; i < file_count; i++) {
      sampling_frequencies.push(selectedProject.files[i].sampling_frequency);
      merged_files.push(selectedProject.files[i].file_id);
    }

    // Check if sampling frequencies of all ends are same
    if (sampling_frequencies.every((val, _i, arr) => val === arr[0])) {
      // all sampling frequencies equal
      sampling_frequency_merged = sampling_frequencies[0];
      timeValues_tomerge = timeValues;
      timeStamps_tomerge = timeStamps;
      analogSignals_tomerge = analogSignals;
      digitalSignals_tomerge = digitalSignals;
      dftPhasors_tomerge = dftPhasors;

      mergeWaveforms();
    } else {
      // all sampling frequencies are not equal
      handleResampling(sampling_frequencies);
    }
  };

  const handleResampling = (sampling_frequencies: number[]) => {
    let max_samp_freq = Math.max(...sampling_frequencies);
    let file_count = selectedProject.files.length;

    resampleDone = new Array(file_count).fill(true);

    sampling_frequency_merged = max_samp_freq;

    for (let i = 0; i < file_count; i++) {
      if (selectedProject.files[i].sampling_frequency < max_samp_freq) {
        timeValues_tomerge[i] = [];
        timeStamps_tomerge[i] = [];
        analogSignals_tomerge[i] = [];
        digitalSignals_tomerge[i] = [];
        dftPhasors_tomerge[i] = [];

        resampleDone[i] = false;
        resampleSignals(selectedProject.files[i].file_id, max_samp_freq);
      } else {
        timeValues_tomerge[i] = timeValues[i];
        timeStamps_tomerge[i] = timeStamps[i];
        analogSignals_tomerge[i] = analogSignals[i];
        digitalSignals_tomerge[i] = digitalSignals[i];
        dftPhasors_tomerge[i] = dftPhasors[i];
      }
    }
    setResampleMessage("Resampling ... ");
    setResampleLoading(true);

    // setMergeError(true);
    // setMergeErrorMessage(
    //   "Unable to merge waveforms of different sampling frequencies"
    // );
  };

  const resampleSignals = (file_id: number, new_samp_rate: number) => {
    resampleService
      .doResample(file_id, new_samp_rate)
      .then((res) => {
        // check which file is returning

        if (res.status === 201) {
          let returned_file_id = res.data;

          for (let i = 0; i < selectedProject.files.length; i++) {
            if (selectedProject.files[i].file_id === returned_file_id) {
              resampleDone[i] = true;
              break;
            }
          }

          let resetLoading = true;
          for (let i = 0; i < selectedProject.files.length; i++) {
            if (resampleDone[i] === false) {
              resetLoading = false;
            }
          }
          if (resetLoading === true) {
            getResampledSignalsFromBackend(new_samp_rate);
          }
        } else {
          console.log(res.statusText);
          setResampleMessage(res.statusText);
        }
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
        console.log("Error: ", err.message);
      });
  };

  const getResampledSignalsFromBackend = (new_samp_rate: number) => {
    console.log("getting resampled signals from backend");

    let file_count = selectedProject.files.length;
    analogDataReceived = new Array(file_count).fill(false);
    digitalDataReceived = new Array(file_count).fill(false);
    phasorDataReceived = new Array(file_count).fill(false);

    setResampleMessage("Getting data from backend ...");

    // get analog signals
    getResampledAnalogSignals(new_samp_rate);
    // get digital signals
    getResampledDigitalSignals(new_samp_rate);
    // get phasors
    getResampledPhasors(new_samp_rate);
  };

  const getResampledAnalogSignals = (new_samp_rate: number) => {
    // get analog signals from backend
    if (selectedProject !== null && selectedProject.files.length !== 0) {
      for (let i = 0; i < selectedProject.files.length; i++) {
        if (selectedProject.files[i].sampling_frequency < new_samp_rate) {
          let file_id = selectedProject.files[i].file_id;
          analogSignalService
            .getAllAnalogSignals(file_id, 2)
            .then((res) => {
              // check which file has returned
              let results = JSON.parse(String(res.data));
              let m = 0;
              let returned_fileid = results.file;
              for (let k = 0; k < selectedProject.files.length; k++) {
                if (returned_fileid === selectedProject.files[k].file_id) m = k;
              }

              const analogSignals_split: any[] = [];
              let L = results.signals.length;
              for (let i = 0; i < L; i++) {
                let value = Object.values(results.signals[i]);
                analogSignals_split.push(value);
              }

              timeValues_tomerge[m] = arrayColumn(analogSignals_split, 7);
              timeStamps_tomerge[m] = strArrayColumn(analogSignals_split, 8);

              for (let i = 0; i < 7; i++) {
                analogSignals_tomerge[m].push(
                  arrayColumn(analogSignals_split, i)
                );
              }
              analogDataReceived[m] = true;

              if (checkIfAllSignalsReceived()) {
                mergeWaveforms();
                setResampleLoading(false);
              }
            })
            .catch((err) => {
              if (err instanceof TypeError) return;
              console.log("Error:", err);
            });
        } else {
          analogDataReceived[i] = true;
        }
      }
    }
  };

  const getResampledDigitalSignals = (new_samp_rate: number) => {
    // get digital signals from backend
    if (selectedProject !== null && selectedProject.files.length !== 0) {
      for (let i = 0; i < selectedProject.files.length; i++) {
        if (selectedProject.files[i].sampling_frequency < new_samp_rate) {
          let file_id = selectedProject.files[i].file_id;
          digitalSignalService
            .getAllDigitalSignals(file_id, 1)
            .then((res) => {
              // check which file has returned
              let results = JSON.parse(String(res.data));
              let m = 0;
              let returned_fileid = results.file;

              for (let k = 0; k < selectedProject.files.length; k++) {
                if (returned_fileid === selectedProject.files[k].file_id) m = k;
              }
              let sig_names = [
                selectedProject.files[m].d1_channel,
                selectedProject.files[m].d2_channel,
                selectedProject.files[m].d3_channel,
                selectedProject.files[m].d4_channel,
                selectedProject.files[m].d5_channel,
                selectedProject.files[m].d6_channel,
                selectedProject.files[m].d7_channel,
                selectedProject.files[m].d8_channel,
                selectedProject.files[m].d9_channel,
                selectedProject.files[m].d10_channel,
                selectedProject.files[m].d11_channel,
                selectedProject.files[m].d12_channel,
              ];

              const digitalSignals_split: any[] = [];
              let L = results.signals.length;
              for (let i = 0; i < L; i++) {
                let value = Object.values(results.signals[i]);
                for (let j = 0; j < value.length; j++) {
                  value[j] = Number(value[j]);
                }
                digitalSignals_split.push(value);
              }

              for (let i = 0; i < digitalSignals_split[0].length; i++) {
                if (sig_names[i] !== "")
                  digitalSignals_tomerge[m].push(
                    arrayColumn(digitalSignals_split, i)
                  );
              }
              digitalDataReceived[i] = true;
              if (checkIfAllSignalsReceived()) {
                mergeWaveforms();
                setResampleLoading(false);
              }
            })
            .catch((err) => {
              if (err instanceof TypeError) return;
              console.log("Error:", err);
            });
        } else {
          digitalDataReceived[i] = true;
        }
      }
    }
  };

  const getResampledPhasors = (new_samp_rate: number) => {
    // get phasors from backend
    if (selectedProject !== null && selectedProject.files.length !== 0) {
      for (let i = 0; i < selectedProject.files.length; i++) {
        if (selectedProject.files[i].sampling_frequency < new_samp_rate) {
          let file_id = selectedProject.files[i].file_id;
          phasorService
            .getAllAPhasors(file_id, 1)
            .then((res) => {
              let results = JSON.parse(String(res.data));
              let m = 0;
              let returned_fileid = results.file;
              for (let k = 0; k < selectedProject.files.length; k++) {
                if (returned_fileid === selectedProject.files[k].file_id) m = k;
              }

              const phasors_split: any[] = [];
              let L = results.phasors.length;
              for (let i = 0; i < L; i++) {
                let value = Object.values(results.phasors[i]);
                phasors_split.push(value);
              }
              for (let i = 0; i < 14; i++) {
                dftPhasors_tomerge[m].push(arrayColumn(phasors_split, i));
              }
              phasorDataReceived[m] = true;
              if (checkIfAllSignalsReceived()) {
                mergeWaveforms();
                setResampleLoading(false);
              }
            })
            .catch((err) => {
              if (err instanceof TypeError) return;
              console.log("Error:", err);
            });
        } else {
          phasorDataReceived[i] = true;
        }
      }
    }
  };

  const checkIfAllSignalsReceived = () => {
    let file_count = selectedProject.files.length;
    for (let i = 0; i < file_count; i++) {
      if (analogDataReceived[i] === false) return false;
      if (digitalDataReceived[i] === false) return false;
      if (phasorDataReceived[i] === false) return false;
    }
    return true;
  };

  const mergeWaveforms = () => {
    // Set this so that the plots types start to be visible in the neavigation bar
    setSelectedMergeType(merge_type);

    let file_count = selectedProject.files.length;
    let indexes: { error: string; startIndex: number[]; endIndex: number[] } = {
      error: "",
      startIndex: [],
      endIndex: [],
    };

    if (merge_type === "real") {
      indexes = mergeByRealTime(file_count, timeValues_tomerge);
    } else if (merge_type === "trigger") {
      indexes = mergeByTriggerTime(file_count, timeValues_tomerge);
    } else if (merge_type === "manual") {
      indexes = mergeByManualSelection(file_count, timeValues_tomerge);
    }

    let startIndex = indexes.startIndex;
    let endIndex = indexes.endIndex;

    if (indexes.startIndex.length > 0) {
      // MERGE SIGNALS BASED ON START AND END INDEXES

      // Merged time signals
      timeValues[file_count] = timeValues_tomerge[0].slice(
        startIndex[0],
        endIndex[0]
      );
      timeStamps[file_count] = timeStamps_tomerge[0].slice(
        startIndex[0],
        endIndex[0]
      );

      let tempAnalog: string[] = []; // no analog channel is selected
      let tempDigital: string[] = []; //no digital channel is selected

      for (let i = 0; i < file_count; i++) {
        // Merged analog signals
        for (let j = 0; j < analogSignals[i].length; j++) {
          analogSignals[file_count].push(
            analogSignals_tomerge[i][j].slice(startIndex[i], endIndex[i])
          );
          analogSignalNames[file_count].push(analogSignalNames[i][j]);
          analogChannelInfo[file_count].push(analogChannelInfo[i][j]);
        }

        // Merged digital signals
        for (let j = 0; j < digitalSignals[i].length; j++) {
          digitalSignals[file_count].push(
            digitalSignals_tomerge[i][j].slice(startIndex[i], endIndex[i])
          );
          digitalSignalNames[file_count].push(digitalSignalNames[i][j]);
        }

        // Merged phasors
        for (let j = 0; j < dftPhasors[i].length; j++) {
          dftPhasors[file_count].push(
            dftPhasors_tomerge[i][j].slice(startIndex[i], endIndex[i])
          );
        }
      }

      let fullAnalog: GridRowSelectionModel = tempAnalog;
      let fullDigital: GridRowSelectionModel = tempDigital;

      tempRowSelectionModel[file_count] = fullAnalog;
      setRowSelectionModel([...tempRowSelectionModel]);

      tempDigitalRowSelectionModel[file_count] = fullDigital;
      setDigitalRowSelectionModel([...tempDigitalRowSelectionModel]);

      setMergeErrorMessage("");
    } else {
      setMergeError(true);
      if (indexes.error === "")
        setMergeErrorMessage("Unable to merge waveforms");
      else setMergeErrorMessage(indexes.error);
    }
  };

  const mergeByRealTime = (
    file_count: number,
    timeValues_tomerge: number[][]
  ) => {
    let error = "";
    let startTimes = [];
    let endTimes = [];

    let duration = [];
    for (let i = 0; i < file_count; i++) {
      // GET AND CONVERT TIMES TO MILLISECONDS SINCE EPOCH
      startTimes.push(
        new Date(selectedProject.files[i].start_time_stamp).getTime()
      );

      // Convert time to microseconds
      startTimes[i] = startTimes[i] * 1000;

      // Add micro seconds portion of the time stamp to the above times
      startTimes[i] =
        startTimes[i] +
        Number(String(selectedProject.files[i].start_time_stamp).slice(20, 26));

      // Convert back to milli seconds
      startTimes[i] = startTimes[i] / 1000;

      duration.push(
        timeValues_tomerge[i][timeValues_tomerge[i].length - 1] -
          timeValues_tomerge[i][0]
      );
      endTimes.push(startTimes[i] + duration[i] * 1000);
    }

    let startIndex: number[] = [];
    let endIndex: number[] = [];
    let offset = 0;
    let timeValues_corrected: number[] = [];

    let startTime = Math.max(...startTimes);
    let endTime = Math.min(...endTimes);

    if (endTime > startTime) {
      // overlap present
      for (let i = 0; i < file_count; i++) {
        // start time
        offset = (startTime - startTimes[i]) / 1000;
        timeValues_corrected = [];
        for (let j = 0; j < timeValues_tomerge[i].length; j++)
          timeValues_corrected.push(
            timeValues_tomerge[i][j] - timeValues_tomerge[i][0] - offset
          );
        startIndex.push(
          timeValues_corrected.findIndex((element) => element >= 0)
        );

        // end time
        offset = (endTime - startTimes[i]) / 1000;
        timeValues_corrected = [];
        for (let j = 0; j < timeValues_tomerge[i].length; j++)
          timeValues_corrected.push(
            timeValues_tomerge[i][j] - timeValues_tomerge[i][0] - offset
          );
        endIndex.push(
          timeValues_corrected.findIndex((element) => element >= 0)
        );
      }
    } else {
      //overlap not present
      error = "No overlap between the records";
    }
    return { error: error, startIndex: startIndex, endIndex: endIndex };
  };

  const mergeByTriggerTime = (
    file_count: number,
    timeValues_tomerge: number[][]
  ) => {
    let error = "";
    let triggerIndexes = [];
    let postFaultLengths = [];
    for (let i = 0; i < file_count; i++) {
      triggerIndexes.push(
        timeValues_tomerge[i].findIndex((element) => element >= 0)
      );
      postFaultLengths.push(timeValues_tomerge[i].length - triggerIndexes[i]);
    }

    let min_prefault_length = Math.min(...triggerIndexes);
    let min_postfault_length = Math.min(...postFaultLengths);

    let startIndex: number[] = [];
    let endIndex: number[] = [];
    for (let i = 0; i < file_count; i++) {
      startIndex[i] = triggerIndexes[i] - min_prefault_length;
      endIndex[i] = triggerIndexes[i] + min_postfault_length;
    }

    return { error: error, startIndex: startIndex, endIndex: endIndex };
  };

  const mergeByManualSelection = (
    file_count: number,
    timeValues_tomerge: number[][]
  ) => {
    let error = "";
    let startIndex: number[] = [];
    let endIndex: number[] = [];

    let mergeIndexes: number[] = [];
    let postFaultLengths = [];
    for (let i = 0; i < file_count; i++) {
      if (axisClick[i] === undefined) {
        error = "One or more primary indexes not selected";
        return { error: error, startIndex: startIndex, endIndex: endIndex };
      }

      let corrected_index = timeValues_tomerge[i].findIndex(
        (element) => element >= timeValues[i][axisClick[i].dataIndex]
      );

      mergeIndexes.push(corrected_index);
      postFaultLengths.push(timeValues_tomerge[i].length - mergeIndexes[i]);
    }

    let min_prefault_length = Math.min(...mergeIndexes);
    let min_postfault_length = Math.min(...postFaultLengths);

    // const indexIsZero = mergeIndexes.some((item) => item === 0);
    // if (indexIsZero === false) {
    for (let i = 0; i < file_count; i++) {
      startIndex[i] = mergeIndexes[i] - min_prefault_length;
      endIndex[i] = mergeIndexes[i] + min_postfault_length;
    }
    // } else {
    //   error = "One or more primary indexes not selected";
    // }

    return { error: error, startIndex: startIndex, endIndex: endIndex };
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
      {navbarStatus && (
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
            mergeViewEnabled={mergeViewEnabled}
            selectedMergeType={selectedMergeType}
          />
        </Grid>
      )}
      <Grid
        item
        sx={{ width: navbarStatus ? `calc(100% - 260px)` : `calc(100%)` }}
      >
        {(selectedPage === "SingleAxis" ||
          selectedPage === "MultipleAxis" ||
          selectedPage === "MergeSingleView" ||
          selectedPage === "MergeMultipleView") && (
          <ChartComponent
            stationName={
              selectedPage.slice(0, 5) === "Merge"
                ? "Merged Waveforms"
                : selectedProject.files[selectedIndex].station_name
            }
            plotName={selectedPage}
            selectedIndex={
              selectedPage.slice(0, 5) === "Merge" ? -1 : selectedIndex
            }
            digitalChannelCount={digitalChannelCount}
            timeValues_original={timeValues[selectedIndex]}
            timeStamps_original={timeStamps[selectedIndex]}
            analog_Values_original={analogSignals[selectedIndex]}
            analogSignalNames={analogSignalNames[selectedIndex]}
            digital_Values_original={digitalSignals[selectedIndex]}
            digitalSignalNames={digitalSignalNames[selectedIndex]}
            dftPhasors={dftPhasors[selectedIndex]}
            error={
              selectedPage.slice(0, 5) === "Merge"
                ? ""
                : asigError[selectedIndex]
            }
            isAnLoading={
              selectedPage.slice(0, 5) === "Merge"
                ? false
                : asigLoading[selectedIndex]
            }
            isDigLoading={
              selectedPage.slice(0, 5) === "Merge"
                ? false
                : dsigLoading[selectedIndex]
            }
            presentZoomValues={
              //  presentZoomValues.length >= selectedIndex + 1
              presentZoomValues[selectedIndex] !== undefined
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
              // axisClick.length >= selectedIndex + 1
              axisClick[selectedIndex] !== undefined
                ? {
                    primary: axisClick[selectedIndex].dataIndex,
                    primaryReduced: axisClick[selectedIndex].dataIndexReduced,
                    primaryTime: axisClick[selectedIndex].axisValue,
                    primaryTimestamp: axisClick[selectedIndex].timestamp,
                    secondary: axisClick[selectedIndex].secondaryIndex,
                    secondaryReduced:
                      axisClick[selectedIndex].secondaryIndexReduced,
                    secondaryTime: axisClick[selectedIndex].secondaryValue,
                    secondaryTimestamp:
                      axisClick[selectedIndex].secondaryTimestamp,
                  }
                : {
                    primary: 0,
                    primaryReduced: 0,
                    primaryTime: 0,
                    primaryTimestamp: "",
                    secondary: 0,
                    secondaryReduced: 0,
                    secondaryTime: 0,
                    secondaryTimestamp: "",
                  }
            }
            onAxisClick={handleAxisClick}
            analogChannelInfo={analogChannelInfo[selectedIndex]}
            sampling_frequency={
              selectedPage.slice(0, 5) === "Merge"
                ? sampling_frequency_merged
                : selectedProject.files[selectedIndex].sampling_frequency
            }
            pointCount={pointCount}
            sidebarStatus={sidebarStatus}
            tooltipStatus={tooltipStatus}
            selectedFile={
              selectedPage.slice(0, 5) === "Merge"
                ? merged_files
                : selectedFile === null
                ? [0]
                : [selectedFile]
            }
            projectId={selectedProject.project_id}
            rowSelectionModel={rowSelectionModel[selectedIndex]}
            digitalRowSelectionModel={digitalRowSelectionModel[selectedIndex]}
            onRowSelectionModelChange={handleAnalogModelChange}
            onDigitalRowSelectionModelChange={handleDigitalModelChange}
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
        {selectedPage === "MergeView" && (
          <>
            <MergeView
              mergeError={mergeError}
              mergeErrorMessage={mergeErrorMessage}
              onMergeErrorClose={() => {
                setMergeError(false);
              }}
              selectedMergeType={selectedMergeType}
              onMergeTypeChange={(newMergeType: string) => {
                handleMerging(newMergeType);
              }}
            />
            <Dialog
              open={resampleLoading}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Resampling in Progress ... "}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {resampleMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setResampleLoading(false);
                  }}
                  autoFocus
                >
                  CANCEL
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default MainComponent;
