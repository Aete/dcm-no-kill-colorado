import { useEffect, useRef } from "react";
import styled from "styled-components";
import { ChartTitle } from "../../common/title";
import { Intake } from "./graph/Intake";
import type { IntakeProcessedData } from "../../../utils/dataProcessing/intakeData";

const IntakeContainer = styled.div`
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

export default function IntakeChart({
  data,
}: {
  data?: IntakeProcessedData | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const intakeInstanceRef = useRef<Intake | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !intakeInstanceRef.current && mounted && data) {
        // Create Intake instance
        const width = chartRef.current.clientWidth || 800;
        const height = 360;
        const intakeInstance = new Intake(
          chartRef.current,
          width,
          height,
          null
        );
        intakeInstanceRef.current = intakeInstance;

        // Render with data
        intakeInstance.render(data);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && intakeInstanceRef.current && mounted) {
        const width = chartRef.current.clientWidth || 800;
        const height = 360;
        intakeInstanceRef.current.updateSize(width, height);
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
      if (intakeInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        intakeInstanceRef.current = null;
      }
    };
  }, [data]);

  // Separate effect for data changes
  useEffect(() => {
    if (intakeInstanceRef.current && data) {
      intakeInstanceRef.current.render(data);
    }
  }, [data]);

  return (
    <IntakeContainer>
      <ChartTitle>Colorado</ChartTitle>
      <ChartWrapper ref={chartRef} />
    </IntakeContainer>
  );
}
