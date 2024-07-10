import { MarkerType, Position } from "reactflow";
import workflowsData from "./workflows.json";
import dagre from "dagre";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";

const getColorByStatus = (status) => {
  switch (status) {
    case "finished":
      return "#8ac926";
    case "inProgress":
      return "#ffb703";
    case "notStarted":
      return "gray";
    default:
      return "gray";
  }
};

const getIconByStatus = (status) => {
  switch (status) {
    case "finished":
      return <CheckCircleIcon style={{ color: "green" }} />;
    case "inProgress":
      return <HourglassEmptyIcon style={{ color: "#ffb703" }} />;
    case "notStarted":
      return <CancelIcon style={{ color: "gray" }} />;
    default:
      return <CancelIcon style={{ color: "gray" }} />;
  }
};

const getAnimationByStatus = (status) => {
  switch (status) {
    case "finished":
    case "inProgress":
      return true;
    default:
      return false;
  }
};

const createGraphLayout = (events) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 150, ranksep: 150 });
  g.setDefaultEdgeLabel(() => ({}));

  events.forEach((event) => {
    g.setNode(event.id.toString(), {
      label: event.event,
      width: 150,
      height: 70,
    });
  });

  events.forEach((event) => {
    event.parent_id.forEach((parentId) => {
      g.setEdge(parentId.toString(), event.id.toString());
    });
  });

  dagre.layout(g);

  return g.nodes().map((node) => {
    const { x, y } = g.node(node);
    return {
      id: node,
      position: { x, y },
    };
  });
};

const createNodes = (events) => {
  const layoutNodes = createGraphLayout(events);

  return events.map((event) => {
    const { id, event: label, status, date, dueDate, stepOwner } = event;
    const { position } = layoutNodes.find((node) => node.id === id.toString());
    console.log("check", event);

    const borderColor = getColorByStatus(status);
    const borderWidth = status === "notStarted" ? "1px" : "3px";
    const opacity = status === "notStarted" ? 0.5 : 1;
    const boxShadow =
      status !== "notStarted" && status !== "default"
        ? `5px 5px 0px 0 ${borderColor}`
        : "none";

    return {
      id: id.toString(),
      data: {
        ...event,
        label: (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "15px",
              fontWeight: "600",
              gap: "15px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-22px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "white",
              }}
            >
              {getIconByStatus(status)}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>{label}</div>
            <div style={{ fontSize: "12px", color: "gray" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarTodayIcon style={{ marginRight: 4 }} />:{" "}
                {date || "N/A"}
              </div>
            </div>
          </div>
        ),
      },
      position: position,
      type: event.type || "default",
      style: {
        border: `${borderWidth} solid ${borderColor}`,
        opacity,
        boxShadow,
        borderRadius: "5px",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
    };
  });
};

const createEdges = (events) => {
  const edges = [];

  events.forEach((event) => {
    event.parent_id.forEach((parentId) => {
      const stroke = getColorByStatus(event.status);
      const strokeWidth = event.status === "notStarted" ? "1px" : "2px";
      const opacity = event.status === "notStarted" ? 0.5 : 1;
      const filter =
        event.status !== "notStarted" && event.status !== "default"
          ? `drop-shadow(5px 10px 5px ${stroke})`
          : "none";

      edges.push({
        id: `${parentId}-${event.id}`,
        source: parentId.toString(),
        target: event.id.toString(),
        type: "smoothstep",
        animated: getAnimationByStatus(event.status),
        style: {
          stroke,
          strokeWidth,
          opacity,
          filter,
        },
      });
    });
  });

  return edges;
};

// Function to check if all parent nodes are finished
const areParentsFinished = (nodeId, events) => {
  const node = events.find(
    (event) => event.id.toString() === nodeId.toString()
  );
  if (!node) return false;

  return node.parent_id.every((parentId) => {
    const parentNode = events.find(
      (event) => event.id.toString() === parentId.toString()
    );
    return parentNode && parentNode.status === "finished";
  });
};

export {
  createNodes,
  createEdges,
  getColorByStatus,
  workflowsData,
  areParentsFinished,
};
