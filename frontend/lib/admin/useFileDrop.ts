"use client";

import { useRef, useState, type DragEvent } from "react";

/** True only for drags carrying files from the OS -- not in-page drags such as thumbnail reordering. */
function carriesFiles(e: DragEvent) {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

/**
 * Makes an element a drop target for files dragged in from the desktop.
 * Spread `dropProps` onto the element and use `dragging` to highlight it.
 *
 * dragenter/dragleave fire for every child the pointer crosses, so a depth
 * counter (rather than a boolean) decides when the drag has really left.
 */
export function useFileDrop(onFiles: (files: FileList) => void, disabled = false) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const dropProps = {
    onDragEnter: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      // Required for the element to accept the drop at all.
      e.preventDefault();
      e.dataTransfer.dropEffect = disabled ? "none" : "copy";
    },
    onDragLeave: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      // Stops the browser from navigating to the dropped file.
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      if (!disabled && e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
    },
  };

  return { dragging, dropProps };
}
