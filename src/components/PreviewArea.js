import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import CatSprite from "./CatSprite";
import Icon from "./Icon";

const PreviewArea = forwardRef(({ reset, handleReset, actionSections }, ref) => {
  const [sprites, setSprites] = useState([
    { id: 1, name: "cat1", position: { x: 0, y: 0 }, angle: 0, isExecuting: false, assignedAction: null },
    { id: 2, name: "cat2", position: { x: 0, y: 0 }, angle: 0, isExecuting: false, assignedAction: null },
  ]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(1);
  const [showActionDropdown, setShowActionDropdown] = useState(null);
  const cancellationRefs = useRef({});

  useImperativeHandle(ref, () => ({
    setCommands(newCommands) {
      setSprites((prevSprites) =>
        prevSprites.map((sprite) =>
          sprite.id === selectedSpriteId
            ? { ...sprite, commands: newCommands }
            : sprite
        )
      );
    },
  }));

  const handleSpriteDrop = (spriteId, monitor) => {
    const offset = monitor.getClientOffset();
    const previewAreaRect = document.querySelector(".preview-area").getBoundingClientRect();

    if (offset && previewAreaRect) {
      const centerX = previewAreaRect.width / 2;
      const centerY = previewAreaRect.height / 2;

      setSprites((prevSprites) =>
        prevSprites.map((sprite) =>
          sprite.id === spriteId
            ? {
                ...sprite,
                position: {
                  x: offset.x - previewAreaRect.left - centerX,
                  y: offset.y - previewAreaRect.top - centerY,
                },
              }
            : sprite
        )
      );
    }
  };

  const executeCommandsSequentially = (spriteId, commands) => {
    const sprite = sprites.find((sprite) => sprite.id === spriteId);
    if (!sprite || !commands || commands.length === 0 || sprite.isExecuting) return;

    setSprites((prevSprites) =>
      prevSprites.map((s) =>
        s.id === spriteId ? { ...s, isExecuting: true } : s
      )
    );

    cancellationRefs.current[spriteId] = false;

    const executeStep = (index) => {
      const updatedSprite = sprites.find((sprite) => sprite.id === spriteId);
      if (!updatedSprite) return;

      if (cancellationRefs.current[spriteId]) {
        setSprites((prevSprites) =>
          prevSprites.map((s) =>
            s.id === spriteId ? { ...s, isExecuting: false } : s
          )
        );
        return;
      }

      if (index >= commands.length) {
        if (commands.some((cmd) => cmd.label === "Repeat Animation")) {
          executeStep(0)
        } else {
          setSprites((prevSprites) =>
            prevSprites.map((s) =>
              s.id === spriteId ? { ...s, isExecuting: false } : s
            )
          );
        }
        return;
      }

      const command = commands[index];
      processCommand(command, spriteId);

      setTimeout(() => executeStep(index + 1), 300);
    };

    executeStep(0);
  };

  const processCommand = (command, spriteId) => {
    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? (() => {
              if (command.label.includes("Move") && command.label.includes("steps")) {
                const steps = parseInt(command.label.split(" ")[1], 10);
                if (!isNaN(steps)) {
                  return {
                    ...sprite,
                    position: {
                      x: sprite.position.x + steps * Math.cos((sprite.angle * Math.PI) / 180),
                      y: sprite.position.y + steps * Math.sin((sprite.angle * Math.PI) / 180),
                    },
                  };
                }
              } else if (command.label.includes("Turn") && command.extraText?.includes("degrees")) {
                const degrees = parseInt(command.extraText.split(" ")[0], 10);
                if (!isNaN(degrees)) {
                  const newAngle =
                    command.iconName === "undo"
                      ? (sprite.angle - degrees) % 360
                      : (sprite.angle + degrees) % 360;
                  return {
                    ...sprite,
                    angle: newAngle < 0 ? newAngle + 360 : newAngle, // Ensure angle is non-negative
                  };
                }
              } else if (command.label.includes("Go to")) {
                const targetX = parseInt(command.x, 10);
                const targetY = parseInt(command.y, 10);
                if (!isNaN(targetX) && !isNaN(targetY)) {
                  return {
                    ...sprite,
                    position: { x: targetX, y: targetY },
                  };
                }
              }
              return sprite;
            })()
          : sprite
      )
    );
  };
  
  const handlePlayClick = () => {
    actionSections.forEach((section) => {
      const assignedSprites = sprites.filter((sprite) => sprite.assignedAction === section.id);
      assignedSprites.forEach((sprite) => {
        executeCommandsSequentially(sprite.id, section.commands);
      });
    });
  };

  const assignActionToSprite = (spriteId, actionId) => {
    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, assignedAction: actionId } : sprite
      )
    );
    setShowActionDropdown(null);
  };

  useEffect(() => {
    if (reset) {
      Object.keys(cancellationRefs.current).forEach((id) => {
        cancellationRefs.current[id] = true;
      });
      setSprites((prevSprites) =>
        prevSprites.map((sprite) => ({
          ...sprite,
          position: { x: 0, y: 0 },
          angle: 0,
          isExecuting: false,
        }))
      );
    }
  }, [reset]);

  const [, drop] = useDrop({
    accept: "SPRITE",
    drop: (item, monitor) => handleSpriteDrop(item.id, monitor),
  });

  return (
    <>
      <div
        ref={drop}
        className="preview-area relative w-full h-4/5 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-md"
      >
        <div
          onClick={handlePlayClick}
          className="absolute top-4 left-4 bg-blue-600 hover:bg-green-700 text-white p-3 rounded-full cursor-pointer flex items-center justify-center"
          title="Start Animation"
        >
          <Icon name="play" size={20} className="text-white" />
        </div>

        <button
          onClick={handleReset}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center"
          title="Reset Animation"
        >
          <Icon name="redo" size={20} className="text-white mr-2" />
          Reset
        </button>

        {sprites.map((sprite) => {
          const [{ isDragging }, drag] = useDrag({
            type: "SPRITE",
            item: { id: sprite.id },
            collect: (monitor) => ({
              isDragging: !!monitor.isDragging(),
            }),
          });
          return (
            <div
              key={sprite.id}
              ref={drag}
              onClick={() => setSelectedSpriteId(sprite.id)}
              style={{
                transform: `translate(${sprite.position.x}px, ${sprite.position.y}px) rotate(${sprite.angle}deg)`,
                transition: sprite.isExecuting && !isDragging ? "transform 0.6s ease-in-out" : "none",
                cursor: "pointer",
                position: "absolute",
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isDragging ? "opacity-50" : "opacity-100"
              }`}
            >
              <CatSprite />
            </div>
          );
        })}

        <div className="absolute bottom-0 w-full bg-white p-4 rounded-t-md flex items-center justify-between text-sm font-medium border-t">
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Sprite:</span>
            <span className="text-gray-600">
              {sprites.find((sprite) => sprite.id === selectedSpriteId)?.name}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">X:</span>
            <span className="text-gray-600">
              {sprites.find((sprite) => sprite.id === selectedSpriteId)?.position.x.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Y:</span>
            <span className="text-gray-600">
              {sprites.find((sprite) => sprite.id === selectedSpriteId)?.position.y.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Angle:</span>
            <span className="text-gray-600">
              {sprites.find((sprite) => sprite.id === selectedSpriteId)?.angle.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 p-4 flex items-center justify-start gap-x-8">
        {sprites.map((sprite) => (
          <div key={sprite.id} className="flex flex-col items-center relative w-20">
            <div className="w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition">
              <CatSprite />
            </div>
            <span className="text-sm font-medium mt-2 text-gray-700">{sprite.name}</span>

            {sprite.assignedAction && (
              <div
                className="absolute top-8 left-0 w-full bg-green-600 text-white text-xs text-center rounded px-1 py-0.5"
                style={{ opacity: 0.8, fontSize: "0.6rem", padding: "0.2rem 0" }}
              >
                {actionSections.find((action) => action.id === sprite.assignedAction)?.name}
              </div>
            )}

            <button
              className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 text-xs rounded shadow-md transition"
              onClick={() => setShowActionDropdown(sprite.id)}
            >
              Add Action
            </button>

            {showActionDropdown === sprite.id && (
              <div
                className="absolute top-12 left-1/2 transform -translate-x-1/2 w-20 bg-white border border-gray-300 shadow-lg rounded-md p-1 z-10 overflow-hidden"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                {actionSections.map((action, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => assignActionToSprite(sprite.id, action.id)}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() =>
            setSprites((prevSprites) => [
              ...prevSprites,
              {
                id: prevSprites.length + 1,
                name: `cat${prevSprites.length + 1}`,
                position: { x: 0, y: 0 },
                angle: 0,
                isExecuting: false,
                assignedAction: null,
              },
            ])
          }
          className="w-16 h-16 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-gray-600 text-xl font-bold transition"
        >
          +
        </button>
      </div>
    </>
  );
});

export default PreviewArea;
