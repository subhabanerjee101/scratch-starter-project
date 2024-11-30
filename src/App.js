import React, { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
  const previewAreaRef = useRef();
  const [reset, setReset] = useState(false);

  const [actionSections, setActionSections] = useState([
    { id: 1, name: "Action 1", commands: [], assignedSpriteId: null },
    { id: 2, name: "Action 2", commands: [], assignedSpriteId: null },
  ]);

  const [sprites, setSprites] = useState([
    { id: 1, name: "cat1", icon: "cat", assignedActionId: null },
    { id: 2, name: "cat2", icon: "cat", assignedActionId: null },
  ]);

  const setCommandsForActionSection = (id, newCommands) => {
    setActionSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, commands: newCommands } : section
      )
    );
  };

  const assignActionToSprite = (spriteId, actionId) => {
    const actionAlreadyAssigned = actionSections.some(
      (section) => section.assignedSpriteId === spriteId
    );
    if (actionAlreadyAssigned) return;

    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? { ...sprite, assignedActionId: actionId }
          : sprite
      )
    );

    setActionSections((prevSections) =>
      prevSections.map((section) =>
        section.id === actionId
          ? { ...section, assignedSpriteId: spriteId }
          : section
      )
    );
  };

  const handleReset = () => {
    setReset(true);
    setTimeout(() => setReset(false), 0);
  };

  const handleAddSprite = () => {
    const newSpriteId = sprites.length + 1;
    setSprites((prevSprites) => [
      ...prevSprites,
      { id: newSpriteId, name: `cat${newSpriteId}`, icon: "cat", assignedActionId: null },
    ]);
  };

  const handleAddActionSection = () => {
    const newActionId = actionSections.length + 1;
    setActionSections((prevSections) => [
      ...prevSections,
      { id: newActionId, name: `Action ${newActionId}`, commands: [], assignedSpriteId: null },
    ]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-6 font-sans h-screen flex flex-col overflow-hidden">
        <div className="flex flex-row flex-1 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="w-1/4 bg-gradient-to-br from-blue-50 to-white border-r border-gray-300 shadow-md">
            <Sidebar />
          </div>

          <div className="w-1/4 flex flex-col bg-gradient-to-br from-indigo-50 to-white border-r border-gray-300 p-4 shadow-md">
            <MidArea
              actionSections={actionSections}
              setCommandsForActionSection={setCommandsForActionSection}
              handleAddActionSection={handleAddActionSection}
            />
          </div>

          <div className="w-1/2 bg-gradient-to-b from-white to-gray-100 p-6 shadow-lg rounded-tr-lg">
            <PreviewArea
              ref={previewAreaRef}
              reset={reset}
              handleReset={handleReset}
              sprites={sprites}
              assignActionToSprite={assignActionToSprite}
              handleAddSprite={handleAddSprite}
              actionSections={actionSections}
            />
          </div>
        </div>
      </div>
    </DndProvider>

  );
}
