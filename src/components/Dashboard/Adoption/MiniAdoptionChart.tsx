import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Adoption } from "./graph/Adoption";
import { CountyTitle } from "../../common/title";

import type { AdoptionProcessedData } from "../../../utils/dataProcessing/adoptionData";

const AdoptionContainer = styled.div`
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

export default function MiniAdoptionChart({
  title,
  data,
}: {
  title: string;
  data?: AdoptionProcessedData | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const adoptionInstanceRef = useRef<Adoption | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !adoptionInstanceRef.current && mounted && data) {
        // Create Adoption instance
        const width = 200;
        const adoptionInstance = new Adoption(
          chartRef.current,
          width,
          200,
          null, // Don't pass data to constructor
          false
        );
        adoptionInstanceRef.current = adoptionInstance;

        // Explicitly render with data
        adoptionInstance.render(data);
      } else {
        console.log(`[${title}] Chart init conditions not met:`, {
          hasChartRef: !!chartRef.current,
          hasInstance: !!adoptionInstanceRef.current,
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
      if (adoptionInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        adoptionInstanceRef.current = null;
      }
    };
  }, [data, title]);

  // Separate effect for data changes
  useEffect(() => {
    if (adoptionInstanceRef.current && data) {
      adoptionInstanceRef.current.render(data);
    }
  }, [data, title]);

  return (
    <AdoptionContainer>
      <CountyTitle>{title}</CountyTitle>
      <ChartWrapper ref={chartRef} />
    </AdoptionContainer>
  );
}
