import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import CatSprite from "./CatSprite";
import Icon from "./Icon";

const PreviewArea = forwardRef(({ reset, handleReset }, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const cancellationRef = useRef(false);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

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
        const centerX = previewAreaRect.width / 2;
        const centerY = previewAreaRect.height / 2;

        setPosition({
          x: offset.x - previewAreaRect.left - centerX,
          y: offset.y - previewAreaRect.top - centerY,
        });
      }
    },
  });

  const executeCommandsSequentially = (commandsToExecute, isRepeated = false) => {
    if (isExecuting) return;
    setIsExecuting(true);
    cancellationRef.current = false;

    const executeStep = (index) => {
      if (cancellationRef.current) {
        setIsExecuting(false);
        return;
      }

      if (index >= commandsToExecute.length) {
        if (isRepeated && !cancellationRef.current) {
          setTimeout(() => executeStep(0), 600);
        } else {
          setIsExecuting(false);
        }
        return;
      }

      const command = commandsToExecute[index];
      processCommand(command);
      setTimeout(() => executeStep(index + 1), 600);
    };

    executeStep(0);
  };

  const processCommand = (command) => {
    if (command.label.includes("Move") && command.label.includes("steps")) {
      const steps = parseInt(command.label.split(" ")[1], 10);
      if (!isNaN(steps)) {
        setPosition((prev) => ({
          x: prev.x + steps * Math.cos((angleRef.current * Math.PI) / 180),
          y: prev.y + steps * Math.sin((angleRef.current * Math.PI) / 180),
        }));
      }
    } else if (command.label.includes("Turn") && command.extraText?.includes("degrees")) {
      const degrees = parseInt(command.extraText.split(" ")[0], 10);
      if (!isNaN(degrees)) {
        setAngle((prev) =>
          command.iconName === "undo" ? prev - degrees : prev + degrees
        );
        angleRef.current += command.iconName === "undo" ? -degrees : degrees;
      }
    } else if (command.label.includes("Go to")) {
      const targetX = parseInt(command.x, 10);
      const targetY = parseInt(command.y, 10);
      if (!isNaN(targetX) && !isNaN(targetY)) {
        setPosition({ x: targetX, y: targetY });
      }
    }
  };

  const handleFlagClick = () => {
    if (!commands.some((cmd) => cmd.label === "When ")) return;

    const actionCommands = commands.filter(
      (cmd) => cmd.label !== "When " && cmd.label !== "Repeat Animation"
    );

    if (commands.some((cmd) => cmd.label === "Repeat Animation")) {
      executeCommandsSequentially(actionCommands, true);
    } else {
      executeCommandsSequentially(actionCommands);
    }
  };

  const handleSpriteClick = () => {
    if (!commands.some((cmd) => cmd.label === "When this sprite clicked")) return;

    const actionCommands = commands.filter(
      (cmd) =>
        cmd.label !== "When " &&
        cmd.label !== "When this sprite clicked" &&
        cmd.label !== "Repeat Animation"
    );

    if (commands.some((cmd) => cmd.label === "Repeat Animation")) {
      executeCommandsSequentially(actionCommands, true);
    } else {
      executeCommandsSequentially(actionCommands);
    }
  };

  useEffect(() => {
    if (reset) {
      cancellationRef.current = true;
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
          transition: isExecuting ? "transform 0.6s ease-in-out" : "none",
          cursor: isDragging ? "grabbing" : "pointer",
        }}
        className="w-16 h-16"
      >
        <CatSprite />
      </div>

      <div className="absolute bottom-4 bg-white p-3 rounded shadow-md flex items-center space-x-4 border">
        <div className="flex items-center">
          <span className="font-bold mr-2">Sprite:</span>
          <span>Cat</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold mr-2">X:</span>
          <span>{position.x.toFixed(2)}</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold mr-2">Y:</span>
          <span>{position.y.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});

export default PreviewArea;
