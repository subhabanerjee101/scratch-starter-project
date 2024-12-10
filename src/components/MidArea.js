import React, { useState } from "react";
import { useDrop } from "react-dnd";
import Icon from "./Icon";

export default function MidArea({ actionSections, setCommandsForActionSection }) {
  return (
    <div className="mid-area grid grid-cols-1 gap-4 p-4 bg-gray-200 h-full overflow-auto">
      {actionSections.map((section) => (
        <ActionSection
          key={section.id}
          section={section}
          setCommandsForActionSection={setCommandsForActionSection}
        />
      ))}
    </div>
  );
}

function ActionSection({ section, setCommandsForActionSection }) {
  const [isOver, setIsOver] = useState(false);

  const [, drop] = useDrop({
    accept: "BLOCK",
    drop: (block) => {
      setCommandsForActionSection(section.id, [...section.commands, block]);
    },
    collect: (monitor) => setIsOver(!!monitor.isOver()),
  });

  const deleteBlock = (index) => {
    setCommandsForActionSection(
      section.id,
      section.commands.filter((_, i) => i !== index)
    );
  };

  const handleEdit = (index, key, newValue) => {
    setCommandsForActionSection(
      section.id,
      section.commands.map((block, i) =>
        i === index ? { ...block, [key]: newValue } : block
      )
    );
  };

  return (
    <div
      ref={drop}
      className={`action-section flex flex-col justify-between bg-white border border-gray-300 rounded-lg p-4 shadow-lg ${
        isOver ? "ring-2 ring-blue-400" : ""
      }`}
      style={{
        flex: "1",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      <h3 className="font-bold text-lg text-gray-800 mb-4">{section.name}</h3>

      {section.commands.length === 0 ? (
        <p className="text-gray-500 italic">Drag and drop blocks here</p>
      ) : (
        <div className="commands-container space-y-3 overflow-y-auto">
          {section.commands.map((block, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm border hover:bg-gray-50 transition"
            >
              <div className="text-sm font-medium text-gray-700">
                <span className="font-bold flex items-center space-x-2">
                  {block.label.includes("Move") && block.label.includes("steps") ? (
                    <>
                      <span>Move</span>
                      <input
                        type="number"
                        value={block.label.split(" ")[1]}
                        onChange={(e) =>
                          handleEdit(index, "label", `Move ${e.target.value} steps`)
                        }
                        className="w-12 border rounded text-center"
                      />
                      <span>steps</span>
                    </>
                  ) : block.label === "Go to Random Position" ? (
                    <span>Go to a Random Position</span>
                  ) : block.label === "Say Hello" ? (
                    <span>Say Hello</span>
                  ) : block.label === "Increase Size" ? (
                    <span>Increase Size by 20%</span>
                  ) : block.label === "Decrease Size" ? (
                    <span>Decrease Size by 20%</span>
                  ) : block.label.includes("Go to") && block.label.includes("x:") ? (
                    <>
                      <span>Go to x:</span>
                      <input
                        type="number"
                        value={block.x || 0}
                        onChange={(e) =>
                          handleEdit(index, "x", parseInt(e.target.value, 10))
                        }
                        className="w-12 border rounded text-center"
                      />
                      <span>y:</span>
                      <input
                        type="number"
                        value={block.y || 0}
                        onChange={(e) =>
                          handleEdit(index, "y", parseInt(e.target.value, 10))
                        }
                        className="w-12 border rounded text-center"
                      />
                    </>
                  ) : (
                    <span>{block.label}</span>
                  )}

                  {block.extraText && block.extraText.includes("degrees") && (
                    <>
                      {block.iconName && (
                        <Icon
                          name={block.iconName}
                          size={15}
                          className={`${block.iconClass}`}
                        />
                      )}
                      <input
                        type="number"
                        value={block.extraText.split(" ")[0]}
                        onChange={(e) =>
                          handleEdit(index, "extraText", `${e.target.value} degrees`)
                        }
                        className="w-12 border rounded text-center"
                      />
                      <span>degrees</span>
                    </>
                  )}
                </span>
              </div>
              <button
                onClick={() => deleteBlock(index)}
                className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                <Icon name="trash" size={15} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
