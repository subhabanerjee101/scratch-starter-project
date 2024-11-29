import React, { useState, forwardRef, useImperativeHandle } from "react";
import { useDrag, useDrop } from "react-dnd";
import CatSprite from "./CatSprite";
import Icon from "./Icon";

const PreviewArea = forwardRef((_, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useImperativeHandle(ref, () => ({
    setCommands(newCommands) {
      setCommands(newCommands);
    },
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SPRITE",
    item: { type: "SPRITE", currentPosition: position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "SPRITE",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const previewArea = document.querySelector(".relative.w-full.h-full");
      const previewAreaRect = previewArea.getBoundingClientRect();

      if (offset && previewAreaRect) {
        const centerX = previewAreaRect.width / 2;
        const centerY = previewAreaRect.height / 2;

        const newPos = {
          x: offset.x - previewAreaRect.left - centerX,
          y: offset.y - previewAreaRect.top - centerY,
        };

        setPosition({
          x: newPos.x,
          y: newPos.y,
        });
      }
    },
  }));

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const executeCommands = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    for (const command of commands) {
      switch (command.label) {
        case "Move 10 steps":
          setPosition((prev) => ({
            x: prev.x + 10 * Math.cos((angle * Math.PI) / 180),
            y: prev.y + 10 * Math.sin((angle * Math.PI) / 180),
          }));
          break;

        case "Turn ":
          if (command.extraText === "15 degrees") {
            if (command.iconName === "undo") {
              setAngle((prev) => prev - 15); // Anticlockwise
            } else if (command.iconName === "redo") {
              setAngle((prev) => prev + 15); // Clockwise
            }
          }
          break;

        default:
          console.warn("Unknown command:", command.label);
          break;
      }

      await delay(1000);
    }

    setIsExecuting(false);
  };

  const handleFlagClick = () => {
    const flagCommands = commands.filter((cmd) => cmd.label === "When ");
    if (flagCommands.length > 0) {
      executeCommands();
    }
  };

  const handleSpriteClick = () => {
    const spriteCommands = commands.filter(
      (cmd) => cmd.label === "When this sprite clicked"
    );
    if (spriteCommands.length > 0) {
      executeCommands();
    }
  };

  return (
    <div
      ref={drop}
      className="relative w-full h-full flex items-center justify-center bg-blue-100"
    >
      <div
        onClick={handleFlagClick}
        className="absolute top-4 left-4 bg-green-500 text-white p-2 rounded cursor-pointer flex items-center justify-center"
      >
        <Icon name="flag" size={20} className="text-white" />
      </div>

      <div
        ref={drag}
        onClick={handleSpriteClick}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${angle}deg)`,
          cursor: isDragging ? "grabbing" : "pointer",
        }}
        className="w-16 h-16"
      >
        <CatSprite />
      </div>
    </div>
  );
});

export default PreviewArea;
