import { useEffect, useRef } from "react";
import styled from "styled-components";
import { CountyTitle } from "../../common/title";
import { Intake } from "./graph/Intake";
import type { IntakeProcessedData } from "../../../utils/dataProcessing/intakeData";

const IntakeContainer = styled.div`
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

export default function MiniIntakeChart({
  title,
  data,
}: {
  title: string;
  data?: IntakeProcessedData | null;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const intakeInstanceRef = useRef<Intake | null>(null);

  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (chartRef.current && !intakeInstanceRef.current && mounted && data) {
        // Create Intake instance
        const width = 200;
        const intakeInstance = new Intake(
          chartRef.current,
          width,
          200,
          null, // Don't pass data to constructor
          false
        );
        intakeInstanceRef.current = intakeInstance;

        // Explicitly render with data
        intakeInstance.render(data);
      } else {
        console.log(`[${title}] Chart init conditions not met:`, {
          hasChartRef: !!chartRef.current,
          hasInstance: !!intakeInstanceRef.current,
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
      if (intakeInstanceRef.current) {
        // Clear the DOM content
        if (chartRef.current) {
          chartRef.current.innerHTML = "";
        }
        intakeInstanceRef.current = null;
      }
    };
  }, [data, title]);

  // Separate effect for data changes
  useEffect(() => {
    if (intakeInstanceRef.current && data) {
      intakeInstanceRef.current.render(data);
    }
  }, [data, title]);

  return (
    <IntakeContainer>
      <CountyTitle>{title}</CountyTitle>
      <ChartWrapper ref={chartRef} />
    </IntakeContainer>
  );
}
