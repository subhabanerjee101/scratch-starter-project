import React, { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
  const previewAreaRef = useRef();
  const [reset, setReset] = useState(false);

  const setCommands = (commands) => {
    previewAreaRef.current?.setCommands(commands);
  };

  const handleReset = () => {
    setReset(true);
    setTimeout(() => setReset(false), 0);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-blue-100 pt-6 font-sans h-screen flex flex-row overflow-hidden">
        <div className="flex-1 flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
          <Sidebar />
          <MidArea setCommands={setCommands} />
        </div>
        <div className="w-1/3 flex bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
          <PreviewArea ref={previewAreaRef} reset={reset} handleReset={handleReset} />
        </div>
      </div>
    </DndProvider>
  );
}
