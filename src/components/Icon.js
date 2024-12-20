import React from "react";

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={`fill-current ${className}`}
      width={size.toString() + "px"}
      height={size.toString() + "px"}
    >
      <use xlinkHref={`${process.env.PUBLIC_URL || ""}/icons/solid.svg#${name}`} />
    </svg>
  );
}
