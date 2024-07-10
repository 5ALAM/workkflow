import React, { useState, useEffect } from "react";
import "./App.css";
import "reactflow/dist/style.css";
import Flow from "./flow";
import {
  Modal,
  Box,
  Typography,
  Button,
  Backdrop,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  createNodes,
  createEdges,
  getColorByStatus,
  workflowsData,
  areParentsFinished,
} from "./flowData";

const App = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(""); // State for new status
  const [events, setEvents] = useState(workflowsData.events); // Local state for events

  // Load data from local storage or use default data
  useEffect(() => {
    const storedData = localStorage.getItem("workflowsData");
    if (storedData) {
      setEvents(JSON.parse(storedData).events);
    } else {
      setEvents(workflowsData.events);
    }
  }, []);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node.data);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNode(null);
  };

  const handleStatusChange = () => {
    if (selectedNode) {
      // Check if all parent nodes are finished
      if (!areParentsFinished(selectedNode.id, events)) {
        alert("Cannot change status. All parent nodes must be finished.");
        return;
      }

      // Find the index of the selected node in events
      const selectedIndex = events.findIndex(
        (event) => event.id === selectedNode.id
      );
      if (selectedIndex !== -1) {
        // Update the status of the selected node in the events state
        const updatedEvents = [...events];
        updatedEvents[selectedIndex].status = newStatus;
        setEvents(updatedEvents);

        // Save updated events to local storage
        localStorage.setItem(
          "workflowsData",
          JSON.stringify({ events: updatedEvents })
        );

        // Close the modal and clear selectedNode
        setOpen(false);
        setSelectedNode(null);
        setNewStatus("");
      }
    }
  };

  const nodes = createNodes(events);
  const edges = createEdges(events);

  return (
    <div>
      <h1>Workflow</h1>
      <Flow edges={edges} nodes={nodes} onNodeClick={handleNodeClick} />
      <Modal
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: selectedNode
              ? `${getColorByStatus(selectedNode.status)}20` // Add transparency
              : "rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px", // Add border-radius for rounded corners
            outline: "none", // Remove default outline
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {selectedNode?.event}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Status: {selectedNode?.status}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Step Owner: {selectedNode?.stepOwner}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date: {selectedNode?.date}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Due Date: {selectedNode?.dueDate}
          </Typography>
          <TextField
            select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="finished">Finished</MenuItem>
            <MenuItem value="inProgress">In Progress</MenuItem>
            <MenuItem value="notStarted">Not Started</MenuItem>
          </TextField>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: getColorByStatus(newStatus), // Color button based on new status
              "&:hover": {
                bgcolor: getColorByStatus(newStatus),
              },
            }}
          >
            Change Status
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default App;
