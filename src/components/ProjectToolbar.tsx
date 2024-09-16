import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import WavesIcon from "@mui/icons-material/Waves";
import AssignmentSharpIcon from "@mui/icons-material/AssignmentSharp";
import Home from "@mui/icons-material/Home";
import PlaceSharpIcon from "@mui/icons-material/PlaceSharp";
import ShopSharpIcon from "@mui/icons-material/ShopSharp";
import JoinLeftIcon from "@mui/icons-material/JoinLeft";
//import Settings from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

//import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AutoAwesomeMotionSharpIcon from "@mui/icons-material/AutoAwesomeMotionSharp";

import Dns from "@mui/icons-material/Dns";
import LineStyleSharpIcon from "@mui/icons-material/LineStyleSharp";

import { useState } from "react";
import Collapse from "@mui/material/Collapse";

interface Props {
  navigationHeader: string;
  navigationPages: string[];
  onSelectNavItem: (pageName: string, file_index?: number) => void;
}

const data = [
  {
    icon: <AssignmentSharpIcon fontSize="small" />,
    label: "General Info",
    page: "GeneralInfo",
  },
  {
    icon: <WavesIcon fontSize="small" />,
    label: "Analog Channels",
    page: "AnalogChannels",
  },
  {
    icon: <LineStyleSharpIcon fontSize="small" />,
    label: "Digtial Channels",
    page: "DigitalChannels",
  },
  {
    icon: <AutoAwesomeMotionSharpIcon fontSize="small" />,
    label: "Single Axis",
    page: "SingleAxis",
  },
  {
    icon: <Dns fontSize="small" />,
    label: "Multiple Axis",
    page: "MultipleAxis",
  },
];

const ProjectToolbar = ({
  navigationHeader,
  navigationPages,
  onSelectNavItem,
}: Props) => {
  const [open, setOpen] = useState([false]);
  // const [selectedPage, setSelectedPage] = useState(["ProjectList"]);

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
        }}
        onClick={() => onSelectNavItem("ProjectList")}
      >
        <ListItemIcon>
          <Home color="primary" />
        </ListItemIcon>
        <ListItemText
          primary="PROJECT LIST"
          primaryTypographyProps={{
            color: "primary",
            fontWeight: "medium",
            variant: "body2",
          }}
        />
      </ListItemButton>
      <Divider variant="middle" />
      <ListItemButton
        sx={{ height: 45 }}
        onClick={() => onSelectNavItem("ProjectDetails")}
      >
        <ListItemIcon>
          <PlaceSharpIcon color="secondary" />
        </ListItemIcon>
        <ListItemText
          primary={navigationHeader !== "" ? navigationHeader : "Select Case"}
          primaryTypographyProps={{
            color: "secondary",
            fontWeight: "medium",
            variant: "body2",
          }}
        />
      </ListItemButton>
      <Divider variant="inset" />
      {navigationPages[0] !== "" && (
        <Box>
          {navigationPages.map((page, index) => (
            <Box key={`${page}-${index}`}>
              <ListItemButton
                sx={{ ml: 2 }}
                onClick={() => {
                  let newOpen = [...open];
                  newOpen[index] = !open[index];
                  setOpen(newOpen);
                }}
              >
                <ListItemIcon>
                  <ShopSharpIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={page}
                  primaryTypographyProps={{
                    color: "success",
                    fontWeight: "bold",
                    variant: "subtitle2",
                  }}
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
                      ml: 2,
                      mb: 0,
                    }}
                  >
                    <ListItemButton
                      sx={{ mt: 0, pl: 4, height: 25, spacing: 0 }}
                      onClick={() => onSelectNavItem(item.page, index)}
                    >
                      <ListItemIcon sx={{ bgcolor: "" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        sx={{ maxLines: 0, bgcolor: "" }}
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: "small",
                          fontSize: "13px",
                          //  variant: "overline",
                        }}
                      />
                    </ListItemButton>
                  </List>
                ))}
              </Collapse>
              <Divider variant="inset" />
            </Box>
          ))}
          <ListItemButton sx={{ ml: 2 }}>
            <ListItemIcon>
              <JoinLeftIcon color="warning" fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary={"MERGE VIEW"}
              primaryTypographyProps={{
                color: "success",
                fontWeight: "bold",
                variant: "subtitle2",
              }}
            />
          </ListItemButton>
        </Box>
      )}
    </List>
  );
};

export default ProjectToolbar;
