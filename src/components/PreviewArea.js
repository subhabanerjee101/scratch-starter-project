import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import CatSprite from "./CatSprite";
import Icon from "./Icon";

const PreviewArea = forwardRef(({ reset, handleReset }, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useImperativeHandle(ref, () => ({
    setCommands(newCommands) {
      setCommands(newCommands);
    },
  }));

  const [{ isDragging }, drag] = useDrag({
    type: "SPRITE",
    item: { type: "SPRITE", currentPosition: position },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: "SPRITE",
    drop: (_, monitor) => {
      const offset = monitor.getClientOffset();
      const previewAreaRect = document
        .querySelector(".relative.w-full.h-full")
        .getBoundingClientRect();

      if (offset && previewAreaRect) {
        const newPos = {
          x: offset.x - previewAreaRect.left - previewAreaRect.width / 2,
          y: offset.y - previewAreaRect.top - previewAreaRect.height / 2,
        };
        setPosition(newPos);
      }
    },
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const executeCommands = async (commandsToExecute) => {
    if (isExecuting) return;
    setIsExecuting(true);

    for (const command of commandsToExecute) {
      if (command.label === "Move 10 steps") {
        setIsTransitioning(true);
        setPosition((prev) => ({
          x: prev.x + 10 * Math.cos((angle * Math.PI) / 180),
          y: prev.y + 10 * Math.sin((angle * Math.PI) / 180),
        }));
      } else if (command.label === "Turn " && command.extraText === "15 degrees") {
        setIsTransitioning(true);
        setAngle((prev) =>
          command.iconName === "undo" ? prev - 15 : prev + 15
        );
      } else {
        console.warn("Unknown command:", command.label);
      }

      await delay(500);
      setIsTransitioning(false);
    }

    setIsExecuting(false);
  };

  const handleFlagClick = () => {
    const flagCommands = commands.filter((cmd) => cmd.label === "When ");
    if (flagCommands.length > 0) {
      const actionCommands = commands.filter(
        (cmd) => cmd.label !== "When " && cmd.label !== "When this sprite clicked"
      );
      executeCommands(actionCommands);
    }
  };

  const handleSpriteClick = () => {
    const spriteCommands = commands.filter(
      (cmd) => cmd.label === "When this sprite clicked"
    );
    if (spriteCommands.length > 0) {
      const actionCommands = commands.filter(
        (cmd) => cmd.label !== "When " && cmd.label !== "When this sprite clicked"
      );
      executeCommands(actionCommands);
    }
  };

  useEffect(() => {
    if (reset) {
      setPosition({ x: 0, y: 0 });
      setAngle(0);
      setCommands([]);
      setIsExecuting(false);
    }
  }, [reset]);

  return (
    <div
      ref={drop}
      className="relative w-full h-full flex flex-col items-center justify-center bg-blue-100"
    >
      <div
        onClick={handleFlagClick}
        className="absolute top-4 left-4 bg-green-500 text-white p-2 rounded cursor-pointer flex items-center justify-center"
      >
        <Icon name="flag" size={20} className="text-white" />
      </div>

      <button
        onClick={handleReset}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600"
      >
        <Icon name="redo" size={20} className="text-white" />
      </button>

      <div
        ref={drag}
        onClick={handleSpriteClick}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${angle}deg)`,
          transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
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
