import { useEffect, useState } from "react";

/** Progress bar that creeps toward 90% while a real request is in flight (we can't know true progress). */
export function useProgress(active) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) { setP(0); return; }
    const iv = setInterval(() => setP((x) => x + (92 - x) * 0.06), 250);
    return () => clearInterval(iv);
  }, [active]);
  return p;
}
