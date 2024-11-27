import { useEffect } from "react";

export function secondsToTime(seconds) {
  const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0"),
    formattedSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  return minutes + ":" + formattedSeconds;
  //return ${m}:${s}`;
}

export const useInitialEffect = (callback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
