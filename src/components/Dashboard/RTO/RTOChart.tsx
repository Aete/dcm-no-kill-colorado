import { useEffect, useRef } from "react";
import styled from "styled-components";
import { RTO, type RTOProcessedData } from "./graph/RTO";
import { ChartTitle } from "../../common/title";

const RTOContainer = styled.div`
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

export default function RTOChart({ data }: { data?: RTOProcessedData | null }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rtoInstanceRef = useRef<RTO | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !rtoInstanceRef.current && mounted) {
        // Create RTO instance
        const width = chartRef.current.clientWidth;
        const rtoInstance = new RTO(chartRef.current, width, width * 0.6, data);
        rtoInstanceRef.current = rtoInstance;
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && rtoInstanceRef.current && mounted) {
        const width = chartRef.current.clientWidth;
        const height = width * 0.6;
        rtoInstanceRef.current.updateSize(width, height);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initChart, 10);

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      if (rtoInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        rtoInstanceRef.current = null;
      }
    };
  }, []);

  // Separate effect for data changes
  useEffect(() => {
    if (rtoInstanceRef.current && data) {
      rtoInstanceRef.current.render(data);
    }
  }, [data]);

  return (
    <RTOContainer>
      <ChartTitle>Colorado</ChartTitle>
      <ChartWrapper ref={chartRef} />
    </RTOContainer>
  );
}
