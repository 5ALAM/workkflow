import React from "react";
import ReactFlow, { Controls, Background, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

// Custom tooltip to style it as required
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[10],
    fontSize: 12,
  },
}));

const NodeWithTooltip = ({ node, children }) => (
  <CustomTooltip
    title={
      <div>
        <p>
          <strong>Event:</strong> {node.data.event}
        </p>
        <p>
          <strong>Status:</strong> {node.data.status}
        </p>
        <p>
          <strong>Date:</strong> {node.data.date || "N/A"}
        </p>
        <p>
          <strong>Due Date:</strong> {node.data.dueDate || "N/A"}
        </p>
        <p>
          <strong>Step Owner:</strong> {node.data.stepOwner || "N/A"}
        </p>
      </div>
    }
    placement="top"
    arrow
  >
    {children}
  </CustomTooltip>
);

function Flow({ edges, nodes, onNodeClick }) {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              label: (
                <NodeWithTooltip node={node}>
                  <div onClick={(event) => onNodeClick(event, node)}>
                    {node.data.label}
                  </div>
                </NodeWithTooltip>
              ),
            },
          }))}
          edges={edges}
          panOnScroll
          fitView
        >
          <Background color="" />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default Flow;
