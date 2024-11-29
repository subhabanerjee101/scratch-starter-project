import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import Icon from "./Icon";

export default function MidArea({ setCommands }) {
  const [droppedBlocks, setDroppedBlocks] = useState([]);

  const [{ isOver }, drop] = useDrop({
    accept: "BLOCK",
    drop: (block) => setDroppedBlocks((prev) => [...prev, block]),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  useEffect(() => {
    setCommands(droppedBlocks);
  }, [droppedBlocks, setCommands]);

  const deleteBlock = (index) => {
    setDroppedBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index, key, newValue) => {
    setDroppedBlocks((prev) =>
      prev.map((block, i) =>
        i === index ? { ...block, [key]: newValue } : block
      )
    );
  };

  return (
    <div
      ref={drop}
      className={`flex-grow flex flex-col bg-white p-4 border border-gray-300 rounded-md ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      <h3 className="font-bold text-lg mb-4">Action</h3>

      {droppedBlocks.length === 0 ? (
        <p className="text-gray-500">Drag and drop blocks here</p>
      ) : (
        droppedBlocks.map((block, index) => (
          <div
            key={index}
            className="bg-gray-200 p-2 my-2 rounded shadow text-sm text-gray-800 flex items-center justify-between"
          >
            <div className="flex items-center">
              {block.label.includes("Move") && block.label.includes("steps") ? (
                <span className="font-bold mr-2">
                  Move{" "}
                  <input
                    type="number"
                    value={block.label.split(" ")[1]}
                    onChange={(e) =>
                      handleEdit(
                        index,
                        "label",
                        `Move ${e.target.value} steps`
                      )
                    }
                    className="w-12 border rounded text-center"
                  />{" "}
                  steps
                </span>
              ) : block.label.includes("Go to") && block.label.includes("x:") ? (
                <span className="font-bold">
                  Go to x:{" "}
                  <input
                    type="number"
                    value={block.x || 0}
                    onChange={(e) =>
                      handleEdit(index, "x", parseInt(e.target.value, 10))
                    }
                    className="w-12 border rounded text-center mx-1"
                  />{" "}
                  y:{" "}
                  <input
                    type="number"
                    value={block.y || 0}
                    onChange={(e) =>
                      handleEdit(index, "y", parseInt(e.target.value, 10))
                    }
                    className="w-12 border rounded text-center mx-1"
                  />
                </span>
              ) : (
                <span className="font-bold mr-2">{block.label}</span>
              )}

              {block.extraText && block.extraText.includes("degrees") ? (
                <span className="font-bold">
                  <input
                    type="number"
                    value={block.extraText.split(" ")[0]}
                    onChange={(e) =>
                      handleEdit(
                        index,
                        "extraText",
                        `${e.target.value} degrees`
                      )
                    }
                    className="w-12 border rounded text-center mx-2"
                  />
                  degrees
                </span>
              ) : (
                block.extraText && <span>{block.extraText}</span>
              )}

              {block.iconName && (
                <Icon
                  name={block.iconName}
                  size={15}
                  className={`${block.iconClass} mx-2`}
                />
              )}
            </div>

            <button
              onClick={() => deleteBlock(index)}
              className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              <Icon name="trash" size={15} className="text-white" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
