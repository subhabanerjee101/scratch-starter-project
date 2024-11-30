import React from "react";
import { useDrag } from "react-dnd";
import Icon from "./Icon";

const DraggableBlock = ({ label, iconName, iconClass, extraText, x, y }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { label, iconName, iconClass, extraText, x, y },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 my-2 text-sm cursor-pointer rounded-lg shadow-md transition ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {label}
      {iconName && (
        <Icon name={iconName} size={15} className={`${iconClass} ml-2`} />
      )}
      {extraText && <span className="ml-2 text-xs">{extraText}</span>}
    </div>
  );
};

export default function Sidebar() {
  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-start p-4 border-r bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg rounded-lg">
      <div className="font-bold text-lg text-gray-800 mb-4">{"Motion"}</div>
      <DraggableBlock label="Move 10 steps" />
      <DraggableBlock
        label="Turn "
        iconName="undo"
        iconClass="text-gray-800"
        extraText="15 degrees"
      />
      <DraggableBlock
        label="Turn "
        iconName="redo"
        iconClass="text-gray-800"
        extraText="15 degrees"
      />
      <DraggableBlock label="Go to x: 50 y: 50" x={50} y={50} />

      <div className="font-bold text-lg text-gray-800 mt-6 mb-4">{"Control"}</div>
      <DraggableBlock label="Repeat Animation" />
    </div>
  );
}
