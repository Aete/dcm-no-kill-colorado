import { useEffect, useRef } from "react";
import styled from "styled-components";
import { RTO, type RTOProcessedData, type RTOData } from "./graph/RTO";
import { CountyTitle } from "../../common/title";

const RTOContainer = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 40px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function MiniRTOChart({
  title,
  data,
}: {
  title: string;
  data?:
    | RTOProcessedData
    | { total: RTOData; dog: RTOData; cat: RTOData }
    | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rtoInstanceRef = useRef<RTO | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !rtoInstanceRef.current && mounted && data) {
        // Ensure data is in correct format
        const processedData: RTOProcessedData = data as RTOProcessedData;

        // Create RTO instance
        const width = 200;
        const rtoInstance = new RTO(
          chartRef.current,
          width,
          200,
          null, // Don't pass data to constructor
          false
        );
        rtoInstanceRef.current = rtoInstance;

        // Explicitly render with data
        rtoInstance.render(processedData);
      } else {
        console.log(`[${title}] Chart init conditions not met:`, {
          hasChartRef: !!chartRef.current,
          hasInstance: !!rtoInstanceRef.current,
          mounted,
          hasData: !!data,
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initChart, 10);

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (rtoInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        rtoInstanceRef.current = null;
      }
    };
  }, [data, title]);

  // Separate effect for data changes
  useEffect(() => {
    if (rtoInstanceRef.current && data) {
      const processedData: RTOProcessedData = data as RTOProcessedData;
      rtoInstanceRef.current.render(processedData);
    }
  }, [data, title]);

  return (
    <RTOContainer>
      <CountyTitle>{title}</CountyTitle>
      <ChartWrapper ref={chartRef} />
    </RTOContainer>
  );
}
