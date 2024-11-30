import React from "react";
import { useDrag } from "react-dnd";

const DraggableSprite = ({ sprite, component, onSelect }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "SPRITE",
      item: { id: sprite.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });
  
    return (
      <div
        ref={drag}
        onClick={() => onSelect(sprite.id)}
        style={{
          transform: `translate(${sprite.position.x}px, ${sprite.position.y}px) rotate(${sprite.angle}deg)`,
          transition: sprite.isExecuting ? "transform 0.6s ease-in-out" : "none",
          cursor: "pointer",
          position: "absolute",
          opacity: isDragging ? 0.5 : 1,
        }}
        className="sprite-container"
      >
        {component}
      </div>
    );
  };
  

export default DraggableSprite;
