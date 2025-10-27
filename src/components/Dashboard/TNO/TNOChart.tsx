import { useEffect, useRef } from "react";
import styled from "styled-components";
import { ChartTitle } from "../../common/title";
import { TNO } from "./graph/TNO";
import type { TNOProcessedData } from "../../../utils/dataProcessing/tnoData";

const TNOContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function TNOChart({ data }: { data?: TNOProcessedData | null }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const tnoInstanceRef = useRef<TNO | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !tnoInstanceRef.current && mounted && data) {
        // Create TNO instance
        const width = chartRef.current.clientWidth || 800;
        const height = 360;
        const tnoInstance = new TNO(chartRef.current, width, height, null);
        tnoInstanceRef.current = tnoInstance;

        // Render with data
        tnoInstance.render(data);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && tnoInstanceRef.current && mounted) {
        const width = chartRef.current.clientWidth || 800;
        const height = 360;
        tnoInstanceRef.current.updateSize(width, height);
      }
    };

    // Use requestAnimationFrame for better timing
    const rafId = requestAnimationFrame(initChart);

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      if (tnoInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        tnoInstanceRef.current = null;
      }
    };
  }, [data]);

  // Separate effect for data changes
  useEffect(() => {
    if (tnoInstanceRef.current && data) {
      tnoInstanceRef.current.render(data);
    }
  }, [data]);

  return (
    <TNOContainer>
      <ChartTitle>Colorado</ChartTitle>
      <ChartWrapper ref={chartRef} />
    </TNOContainer>
  );
}
