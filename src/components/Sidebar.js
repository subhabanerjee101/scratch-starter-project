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
      className={`flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {label}
      {iconName && (
        <Icon name={iconName} size={15} className={`${iconClass} mx-2`} />
      )}
      {extraText && extraText}
    </div>
  );
};

export default function Sidebar() {
  return (
    <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200">
      <div className="font-bold">{"Events"}</div>
      <DraggableBlock
        label="When "
        iconName="flag"
        iconClass="text-green-600"
        extraText="clicked"
      />
      <DraggableBlock label="When this sprite clicked" />
      <div className="font-bold">{"Motion"}</div>
      <DraggableBlock label="Move 10 steps" />
      <DraggableBlock
        label="Turn "
        iconName="undo"
        iconClass="text-white"
        extraText="15 degrees"
      />
      <DraggableBlock
        label="Turn "
        iconName="redo"
        iconClass="text-white"
        extraText="15 degrees"
      />
      <DraggableBlock label="Go to x: 50 y: 50" x={50} y={50} />
      <div className="font-bold">{"Control"}</div>
      <DraggableBlock label="Repeat Animation" />
    </div>
  );
}
