import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import WavesIcon from "@mui/icons-material/Waves";
import AssignmentSharpIcon from "@mui/icons-material/AssignmentSharp";
import Home from "@mui/icons-material/Home";
import PlaceSharpIcon from "@mui/icons-material/PlaceSharp";
//import ShopSharpIcon from "@mui/icons-material/ShopSharp";
import JoinLeftIcon from "@mui/icons-material/JoinLeft";
//import Settings from "@mui/icons-material/Settings";

//import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";

import Dns from "@mui/icons-material/Dns";
import LineStyleSharpIcon from "@mui/icons-material/LineStyleSharp";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";

interface Props {
  navigationHeader: string;
  navigationPages: string[];
  onSelectNavItem: (pageName: string, file_index?: number) => void;
  mergeViewEnabled: boolean;
  selectedMergeType: string;
}

const data = [
  {
    icon: <AssignmentSharpIcon fontSize="small" />,
    label: "General Info",
    page: "GeneralInfo",
  },
  {
    icon: <WavesIcon fontSize="small" />,
    label: "Analog Info",
    page: "AnalogChannels",
  },
  {
    icon: <LineStyleSharpIcon fontSize="small" />,
    label: "Digtial Info",
    page: "DigitalChannels",
  },
  {
    icon: <AutoAwesomeMotionSharpIcon fontSize="small" />,
    label: "Single Axis Plots",
    page: "SingleAxis",
  },
  {
    icon: <Dns fontSize="small" />,
    label: "Multiple Axis Plots",
    page: "MultipleAxis",
  },
];

const ProjectToolbar = ({
  navigationHeader,
  navigationPages,
  onSelectNavItem,
  mergeViewEnabled,
  selectedMergeType,
}: Props) => {
  const [open, setOpen] = useState([false]);
  const [selectedPage, setSelectedPage] = useState("ProjectList");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState("");
  //  const [projectListHover, setProjectListHover] = useState(false);

  return (
    <List
      sx={{
        width: "240px",
        height: "100vh",
        paddingTop: "80px",
        bgcolor: "background.paper",
      }}
      component="nav"
      aria-labelledby="navigation-bar"
    >
      <ListItemButton
        sx={{
          height: 45,
          bgcolor: selectedPage === "ProjectList" ? "primary.main" : "",
          borderBottom: selectedPage === "ProjectList" ? 0.5 : 0,
          borderRadius: 0,
          borderColor: "primary.main",
          mr: 1,
        }}
        onClick={() => {
          onSelectNavItem("ProjectList");
          setSelectedPage("ProjectList");
          setSelectedIndex(-1);
        }}
        alignItems="center"
      >
        <ListItemIcon
          sx={{
            mr: 0,
            pr: 0,
            color: selectedPage === "ProjectList" ? "white" : "primary.main",
          }}
        >
          <Home />
        </ListItemIcon>
        <ListItemText
          primary="ANALYSIS LIST"
          primaryTypographyProps={{
            color: selectedPage === "ProjectList" ? "white" : "primary",
            fontWeight: "medium",
            variant: "body2",
          }}
          sx={{
            pl: 0,
            ml: -3,
            pt: 0.5,
          }}
        />
      </ListItemButton>
      <Divider variant="middle" />
      <ListItemButton
        sx={{
          height: 45,
          mr: 1,
          bgcolor: selectedPage === "ProjectDetails" ? "secondary.main" : "",
          borderBottom: selectedPage === "ProjectDetails" ? 0.5 : 0,
          borderRadius: 0,
          borderColor: "secondary.main",
        }}
        onClick={() => {
          onSelectNavItem("ProjectDetails");
          setSelectedPage("ProjectDetails");
        }}
      >
        <ListItemIcon
          sx={{
            mr: 0,
            pr: 0,
            color:
              selectedPage === "ProjectDetails" ? "white" : "secondary.main",
          }}
        >
          <PlaceSharpIcon />
        </ListItemIcon>
        <ListItemText
          primary={navigationHeader !== "" ? navigationHeader : "Select Case"}
          primaryTypographyProps={{
            color: selectedPage === "ProjectDetails" ? "white" : "secondary",
            fontWeight: "medium",
            variant: "body2",
          }}
          sx={{ pl: 0, ml: -3, pt: 0.5 }}
        />
      </ListItemButton>
      {navigationPages[0] !== "" && (
        <Box>
          {navigationPages.map((page, index) => (
            <Box key={`${page}-${index}`} sx={{ ml: 2, mb: 0, mt: 0.5, p: 0 }}>
              <ListItemButton
                sx={{
                  ml: 0,
                  mr: 1,
                  mb: selectedIndex === index && selectedPage === "" ? 1 : 0,
                  mt: selectedIndex === index && selectedPage === "" ? 1 : 0,
                  borderBottom:
                    selectedIndex === index && selectedPage === "" ? 0.2 : 0,
                  borderColor: "lightgrey",
                  borderRadius: 2,
                  bgcolor:
                    selectedIndex === index && selectedPage === ""
                      ? "success.main"
                      : "",
                }}
                onClick={() => {
                  let newOpen = [...open];
                  newOpen[index] = !open[index];
                  setOpen(newOpen);
                  setSelectedPage("");
                }}
              >
                <ListItemIcon
                  sx={{
                    pr: 0,
                    mr: 0,
                    color:
                      selectedIndex === index && selectedPage === ""
                        ? "white"
                        : "success.main",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        selectedIndex === index && selectedPage === ""
                          ? "white"
                          : "success.main",
                      height: 20,
                      width: 20,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color:
                          selectedIndex === index && selectedPage === ""
                            ? "success.main"
                            : "white",
                        alignItems: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Avatar>
                  {/* <ShopSharpIcon fontSize="small" /> */}
                </ListItemIcon>
                <ListItemText
                  primary={page}
                  primaryTypographyProps={{
                    color:
                      selectedIndex === index && selectedPage === ""
                        ? "white"
                        : "success.main",
                    fontWeight: "bold",
                    variant: "subtitle2",
                  }}
                  sx={{ pl: 0, ml: -3, pt: 0 }}
                />
                {open[index] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open[index]} timeout="auto" unmountOnExit>
                {data.map((item) => (
                  <List
                    key={`${page}-${item.label}`}
                    component="div"
                    disablePadding
                    sx={{
                      ml: 1.5,
                      mb: 0,
                    }}
                  >
                    <ListItemButton
                      sx={{
                        mt: 0,
                        pl: 2,
                        pr: 0,
                        mr: 0,
                        height: 25,
                        spacing: 0,
                      }}
                      onClick={() => {
                        onSelectNavItem(item.page, index);
                        setSelectedIndex(index);
                        setSelectedItem(item.page);
                        setSelectedPage("");
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color:
                            selectedItem === item.page &&
                            selectedIndex == index &&
                            selectedPage === ""
                              ? "success.main"
                              : "",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          maxLines: 0,
                          pl: 0,
                          ml: -3,
                          fontSize: "10px",
                          variant: "overline",
                        }}
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: "overline",
                          color:
                            selectedItem === item.page &&
                            selectedIndex == index &&
                            selectedPage === ""
                              ? "success.main"
                              : "",
                          fontWeight:
                            selectedItem === item.page &&
                            selectedIndex == index &&
                            selectedPage === ""
                              ? "900"
                              : "400",
                          fontSize: "10px",
                        }}
                      />
                    </ListItemButton>
                  </List>
                ))}
              </Collapse>
              {!open[index] && selectedIndex !== index && (
                <Divider variant="inset" />
              )}
            </Box>
          ))}
          {navigationPages.length > 1 && (
            <Box key={"mergeBox"} sx={{ ml: 2, mb: 0, mt: 0.5, p: 0 }}>
              <ListItemButton
                sx={{
                  ml: 0,
                  mr: 1,
                  mb: selectedPage === "MergeView" ? 1 : 0,
                  mt: selectedPage === "MergeView" ? 1 : 0,
                  borderBottom: selectedPage === "MergeView" ? 0.2 : 0,
                  borderColor: "lightgrey",
                  borderRadius: 2,
                  bgcolor:
                    selectedPage === "MergeView" &&
                    selectedIndex !== navigationPages.length
                      ? "warning.main"
                      : "",
                }}
                onClick={() => {
                  if (mergeViewEnabled) {
                    let newOpen = [...open];
                    newOpen[navigationPages.length] =
                      !open[navigationPages.length];
                    setOpen(newOpen);
                    setSelectedPage("MergeView");
                    onSelectNavItem("MergeView");
                    setSelectedIndex(0);
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    pr: 0,
                    mr: 0,
                    color:
                      selectedPage === "MergeView" &&
                      selectedIndex !== navigationPages.length
                        ? "white"
                        : "warning.main",
                  }}
                >
                  <JoinLeftIcon fontSize="medium" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    mergeViewEnabled ? "MERGE VIEW" : "MERGE Loading ..."
                  }
                  primaryTypographyProps={{
                    color:
                      selectedPage === "MergeView" &&
                      selectedIndex !== navigationPages.length
                        ? "white"
                        : "warning.main",
                    fontWeight: "bold",
                    variant: "subtitle2",
                  }}
                  sx={{ pl: 0, ml: -2.5, pt: 0 }}
                />
                {open[navigationPages.length] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              {selectedMergeType !== "" && (
                <Collapse
                  in={open[navigationPages.length]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List
                    key={"merge-subitems"}
                    component="div"
                    disablePadding
                    sx={{
                      ml: 1.5,
                      mb: 0,
                    }}
                  >
                    <ListItemButton
                      sx={{
                        mt: 0,
                        pl: 2,
                        pr: 0,
                        mr: 0,
                        height: 25,
                        spacing: 0,
                      }}
                      onClick={() => {
                        setSelectedIndex(navigationPages.length);
                        setSelectedItem(data[3].page);
                        setSelectedPage("MergeView");
                        onSelectNavItem("MergeSingleView");
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color:
                            selectedItem === data[3].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "warning.main"
                              : "",
                        }}
                      >
                        {data[3].icon}
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          maxLines: 0,
                          pl: 0,
                          ml: -3,
                          fontSize: "10px",
                          variant: "overline",
                        }}
                        primary={data[3].label}
                        primaryTypographyProps={{
                          variant: "overline",
                          color:
                            selectedItem === data[3].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "warning.main"
                              : "",
                          fontWeight:
                            selectedItem === data[3].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "900"
                              : "400",
                          fontSize: "10px",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      sx={{
                        mt: 0,
                        pl: 2,
                        pr: 0,
                        mr: 0,
                        height: 25,
                        spacing: 0,
                      }}
                      onClick={() => {
                        setSelectedIndex(navigationPages.length);
                        setSelectedItem(data[4].page);
                        setSelectedPage("MergeView");
                        onSelectNavItem("MergeMultipleView");
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color:
                            selectedItem === data[4].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "warning.main"
                              : "",
                        }}
                      >
                        {data[4].icon}
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          maxLines: 0,
                          pl: 0,
                          ml: -3,
                          fontSize: "10px",
                          variant: "overline",
                        }}
                        primary={data[4].label}
                        primaryTypographyProps={{
                          variant: "overline",
                          color:
                            selectedItem === data[4].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "warning.main"
                              : "",
                          fontWeight:
                            selectedItem === data[4].page &&
                            selectedIndex === navigationPages.length &&
                            selectedPage === "MergeView"
                              ? "900"
                              : "400",
                          fontSize: "10px",
                        }}
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              )}
            </Box>
          )}
        </Box>
      )}
    </List>
  );
};

export default ProjectToolbar;
