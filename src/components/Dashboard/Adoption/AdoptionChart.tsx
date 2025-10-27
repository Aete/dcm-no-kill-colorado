import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Adoption } from "./graph/Adoption";
import { ChartTitle } from "../../common/title";

import type { AdoptionProcessedData } from "../../../utils/dataProcessing/adoptionData";

const AdoptionContainer = styled.div`
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

export default function AdoptionChart({
  data,
}: {
  data?: AdoptionProcessedData | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const adoptionInstanceRef = useRef<Adoption | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !adoptionInstanceRef.current && mounted) {
        // Create Adoption instance
        const width = chartRef.current.clientWidth;
        const adoptionInstance = new Adoption(
          chartRef.current,
          width,
          width * 0.6,
          data
        );
        adoptionInstanceRef.current = adoptionInstance;
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && adoptionInstanceRef.current && mounted) {
        const width = chartRef.current.clientWidth;
        const height = width * 0.6;
        adoptionInstanceRef.current.updateSize(width, height);
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
      if (adoptionInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        adoptionInstanceRef.current = null;
      }
    };
  }, []);

  // Separate effect for data changes
  useEffect(() => {
    if (adoptionInstanceRef.current && data) {
      adoptionInstanceRef.current.render(data);
    }
  }, [data]);

  return (
    <AdoptionContainer>
      <ChartTitle>Colorado</ChartTitle>
      <ChartWrapper ref={chartRef} />
    </AdoptionContainer>
  );
}
