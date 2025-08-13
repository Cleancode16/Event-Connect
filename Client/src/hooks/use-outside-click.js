import React, { useEffect } from "react";

export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

// Example of using the hook in a component:
export function ExampleComponent() {
  const ref = React.useRef();

  const handleClickOutside = () => {
    alert("Clicked outside!");
  };

  useOutsideClick(ref, handleClickOutside);

  return (
    <div ref={ref} style={{ padding: 20, backgroundColor: "#ddd" }}>
      Click outside this box to trigger the alert.
    </div>
  );
}
