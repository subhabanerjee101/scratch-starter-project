import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import CatSprite from "./CatSprite";
import BallSprite from "./BallSprite";
import MouseSprite from "./MouseSprite";
import Icon from "./Icon";
import DraggableSprite from "./DraggableSprite";

const spriteComponents = {
  Cat: CatSprite,
  Ball: BallSprite,
  Mouse: MouseSprite,
};

const PreviewArea = forwardRef(({ reset, handleReset, actionSections }, ref) => {
  const [sprites, setSprites] = useState([]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);
  const [showActionDropdown, setShowActionDropdown] = useState(null);
  const [showSpriteMenu, setShowSpriteMenu] = useState(false);
  const [collisionHandled, setCollisionHandled] = useState(new Set());
  const cancellationRefs = useRef({});
  const selectedSprite = sprites.find((sprite) => sprite.id === selectedSpriteId);

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

  const addSprite = (spriteType) => {
    const existingCount = sprites.filter((sprite) => sprite.type === spriteType).length;
    const newSprite = {
      id: sprites.length + 1,
      name: `${spriteType} ${existingCount + 1}`,
      type: spriteType,
      position: { x: 0, y: 0 },
      angle: 0,
      isExecuting: false,
      assignedAction: null,
      commands: [],
    };
    setSprites((prevSprites) => [...prevSprites, newSprite]);
    setShowSpriteMenu(false);
  };

  const isColliding = (sprite1, sprite2) => {
    if (
      sprite1.position.x === 0 &&
      sprite1.position.y === 0 &&
      sprite2.position.x === 0 &&
      sprite2.position.y === 0
    ) {
      return false;
    }
    const rect1 = {
      left: sprite1.position.x,
      right: sprite1.position.x + 50,
      top: sprite1.position.y,
      bottom: sprite1.position.y + 50,
    };
    const rect2 = {
      left: sprite2.position.x,
      right: sprite2.position.x + 50,
      top: sprite2.position.y,
      bottom: sprite2.position.y + 50,
    };
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  const executeCommandsSequentially = async (spriteId, commands) => {
    const sprite = sprites.find((sprite) => sprite.id === spriteId);
    if (!sprite || !commands || commands.length === 0) return;
    cancellationRefs.current[spriteId] = false;
    setSprites((prevSprites) =>
      prevSprites.map((s) =>
        s.id === spriteId ? { ...s, isExecuting: true } : s
      )
    );
    let index = 0;
    while (!cancellationRefs.current[spriteId]) {
      const command = commands[index];
      processCommand(command, spriteId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (command.label === "Repeat Animation") {
        const hasRepeatTile = commands.some((cmd) => cmd.label === "Repeat Animation");
        if (!hasRepeatTile) {
          break;
        }
      }
      index = (index + 1) % commands.length;
      if (!commands.some((cmd) => cmd.label === "Repeat Animation")) {
        break;
      }
    }
    setSprites((prevSprites) =>
      prevSprites.map((s) =>
        s.id === spriteId ? { ...s, isExecuting: false } : s
      )
    );
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
                      ? sprite.angle - degrees
                      : sprite.angle + degrees;
                  return {
                    ...sprite,
                    angle: newAngle,
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

  const deleteSprite = (spriteId) => {
    setSprites((prevSprites) => prevSprites.filter((sprite) => sprite.id !== spriteId));

    if (selectedSpriteId === spriteId) {
      setSelectedSpriteId(null);
    }
  };

  const handlePlayClick = () => {
    sprites.forEach((sprite) => {
      if (sprite.commands && sprite.commands.length > 0) {
        executeCommandsSequentially(sprite.id, sprite.commands);
      }
    });
  };

  const assignActionToSprite = (spriteId, actionId) => {
    const action = actionSections.find((action) => action.id === actionId);
    if (!action) {
      console.error(`Action with ID ${actionId} not found.`);
      return;
    }
    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? { ...sprite, assignedAction: actionId, commands: action.commands }
          : sprite
      )
    );
    setShowActionDropdown(null);
  };

  const handleCollision = (sprite1, sprite2) => {
    const collisionKey = `${Math.min(sprite1.id, sprite2.id)}-${Math.max(sprite1.id, sprite2.id)}`;
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => {
        if (sprite.id === sprite1.id || sprite.id === sprite2.id) {
          return { ...sprite, isColliding: true };
        }
        return sprite;
      })
    );
    setTimeout(() => {
      setSprites((prevSprites) =>
        prevSprites.map((sprite) => ({ ...sprite, isColliding: false }))
      );
    }, 1000);
    cancellationRefs.current[sprite1.id] = true;
    cancellationRefs.current[sprite2.id] = true;
    const swappedCommands1 = [...sprite2.commands];
    const swappedCommands2 = [...sprite1.commands];
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => {
        if (sprite.id === sprite1.id) {
          return { ...sprite, isExecuting: false, commands: swappedCommands1 };
        }
        if (sprite.id === sprite2.id) {
          return { ...sprite, isExecuting: false, commands: swappedCommands2 };
        }
        return sprite;
      })
    );
    setTimeout(() => {
      executeCommandsSequentially(sprite1.id, swappedCommands1);
      executeCommandsSequentially(sprite2.id, swappedCommands2);
    }, 500);
    setTimeout(() => {
      setCollisionHandled((prev) => {
        const updatedSet = new Set(prev);
        updatedSet.delete(collisionKey);
        return updatedSet;
      });
    }, 1000);
  };

  useEffect(() => {
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => {
        if (sprite.assignedAction) {
          const updatedAction = actionSections.find(
            (action) => action.id === sprite.assignedAction
          );
          if (updatedAction) {
            if (JSON.stringify(sprite.commands) !== JSON.stringify(updatedAction.commands)) {
              return { ...sprite, commands: updatedAction.commands || [] };
            }
          }
        }
        return sprite;
      })
    );
  }, [actionSections]);

  useEffect(() => {
    const detectCollisions = () => {
      const newCollisionPairs = [];
      sprites.forEach((sprite1, i) => {
        sprites.slice(i + 1).forEach((sprite2) => {
          if (isColliding(sprite1, sprite2)) {
            const collisionKey = `${Math.min(sprite1.id, sprite2.id)}-${Math.max(sprite1.id, sprite2.id)}`;
            if (!collisionHandled.has(collisionKey)) {
              newCollisionPairs.push({ sprite1, sprite2, collisionKey });
            }
          }
        });
      });
      newCollisionPairs.forEach(({ sprite1, sprite2, collisionKey }) => {
        setCollisionHandled((prev) => new Set(prev).add(collisionKey));
        handleCollision(sprite1, sprite2);
      });
    };
  
    if (sprites.length > 1) {
      detectCollisions();
    }
  }, [sprites]);

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
          assignedAction: null,
          commands: [],
        }))
      );
      setCollisionHandled(new Set());
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
          const SpriteComponent = spriteComponents[sprite.type];
          return (
            <DraggableSprite
              key={sprite.id}
              sprite={sprite}
              component={
                <div
                  className={`relative ${
                    sprite.isColliding ? "animate-pulse" : ""
                  }`}
                >
                  <SpriteComponent />
                </div>
              }
              onSelect={setSelectedSpriteId}
            />
          );
        })}

        <div className="absolute bottom-0 w-full bg-white p-4 rounded-t-md flex items-center justify-between text-sm font-medium border-t">
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Sprite:</span>
            <span className="text-gray-600">{selectedSprite ? selectedSprite.name : "N/A"}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">X:</span>
            <span className="text-gray-600">
              {selectedSprite ? selectedSprite.position.x.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Y:</span>
            <span className="text-gray-600">
              {selectedSprite ? selectedSprite.position.y.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 mr-2">Angle:</span>
            <span className="text-gray-600">
              {selectedSprite ? selectedSprite.angle.toFixed(2) : "N/A"}°
            </span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 p-4 flex items-center justify-start gap-x-8">
        {sprites.map((sprite) => (
          <div key={sprite.id} className="flex flex-col items-center relative w-20">
            <div className="w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition">
              <button
                onClick={() => deleteSprite(sprite.id)}
                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
              >
                ×
              </button>
              {React.createElement(spriteComponents[sprite.type])}
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
                    className={`block w-full text-left px-2 py-1 text-xs transition ${
                      action.commands && action.commands.length > 0
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (action.commands && action.commands.length > 0) {
                        assignActionToSprite(sprite.id, action.id);
                      }
                    }}
                    disabled={!action.commands || action.commands.length === 0}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowSpriteMenu(!showSpriteMenu)}
          className="w-16 h-16 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-gray-600 text-xl font-bold transition"
        >
          +
        </button>
      </div>

      {showSpriteMenu && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-md p-4 z-10 flex gap-4">
          {Object.keys(spriteComponents).map((type) => (
            <button
              key={type}
              onClick={() => addSprite(type)}
              className="bg-blue-100 hover:bg-blue-200 text-gray-700 px-4 py-2 rounded shadow transition"
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </>
  );
});

export default PreviewArea;
