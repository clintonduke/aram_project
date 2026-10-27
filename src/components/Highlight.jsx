import React, { createContext, useContext, useMemo, useState } from 'react';

// Shared "which map feature / point is highlighted" state, so the map and the
// list of points can light each other up.
const Ctx = createContext({ active: null, pinned: null, hover: () => {}, pin: () => {} });

export function HighlightProvider({ children }) {
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null); // set by click/tap, stays until tapped again
  const value = useMemo(
    () => ({
      active: hovered ?? pinned,
      pinned,
      hover: setHovered,
      pin: (id) => setPinned((cur) => (cur === id ? null : id)),
    }),
    [hovered, pinned]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useHighlight = () => useContext(Ctx);
