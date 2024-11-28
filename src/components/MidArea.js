import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import Icon from "./Icon";

export default function MidArea({ setCommands }) {
  const [droppedBlocks, setDroppedBlocks] = useState([]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item) => addBlock(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addBlock = (block) => {
    setDroppedBlocks((prev) => [...prev, block]);
  };

  useEffect(() => {
    setCommands(droppedBlocks);
  }, [droppedBlocks, setCommands]);

  return (
    <div
      ref={drop}
      className={`flex-grow flex flex-col bg-white p-4 border border-gray-300 rounded-md ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      <h3 className="font-bold text-lg mb-4">Workspace</h3>
      {droppedBlocks.length === 0 && (
        <p className="text-gray-500">Drag and drop blocks here</p>
      )}
      {droppedBlocks.map((block, index) => (
        <div
          key={index}
          className="bg-gray-200 p-2 my-2 rounded shadow text-sm text-gray-800 flex items-center"
        >
          <span className="font-bold mr-2">{block.label}</span>
          {block.iconName && (
            <Icon name={block.iconName} size={15} className={`${block.iconClass} mx-2`} />
          )}
          <span>{block.extraText}</span>
        </div>
      ))}
    </div>
  );
}
