import { useEffect, useRef } from "react";
import styled from "styled-components";
import { CountyTitle } from "../../common/title";
import { TNO } from "./graph/TNO";
import type { TNOProcessedData, TNOData } from "../../../utils/dataProcessing/tnoData";

const TNOContainer = styled.div`
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

export default function MiniTNOChart({
  title,
  data,
}: {
  title: string;
  data?:
    | TNOProcessedData
    | { total: TNOData; dog: TNOData; cat: TNOData }
    | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const tnoInstanceRef = useRef<TNO | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !tnoInstanceRef.current && mounted && data) {
        // Ensure data is in correct format
        const processedData: TNOProcessedData = data as TNOProcessedData;

        // Create TNO instance
        const width = 200;
        const tnoInstance = new TNO(
          chartRef.current,
          width,
          200,
          null, // Don't pass data to constructor
          false
        );
        tnoInstanceRef.current = tnoInstance;

        // Explicitly render with data
        tnoInstance.render(processedData);
      } else {
        console.log(`[${title}] Chart init conditions not met:`, {
          hasChartRef: !!chartRef.current,
          hasInstance: !!tnoInstanceRef.current,
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
      if (tnoInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        tnoInstanceRef.current = null;
      }
    };
  }, [data, title]);

  // Separate effect for data changes
  useEffect(() => {
    if (tnoInstanceRef.current && data) {
      const processedData: TNOProcessedData = data as TNOProcessedData;
      tnoInstanceRef.current.render(processedData);
    }
  }, [data, title]);

  return (
    <TNOContainer>
      <CountyTitle>{title}</CountyTitle>
      <ChartWrapper ref={chartRef} />
    </TNOContainer>
  );
}
