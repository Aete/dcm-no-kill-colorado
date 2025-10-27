import styled from "styled-components";
import RTOChart from "./RTO/RTOChart";
import type { RTOProcessedData } from "./RTO/graph/RTO";
import { useEffect, useState } from "react";
import { getRTOData } from "../../utils/dataProcessing/rtoData";
import { ChapterTitle, QuestionTitle } from "../common/title";
import { breakpoints } from "../../utils/responsive";
import QuestionRTO from "./RTO/QuestionRTO";
import QuestionTNO from "./TNO/QuestionTNO";
import QuestionAdoption from "./Adoption/QuestionAdoption";
import QuestionIntake from "./Intake/QuestionIntake";

const DashboardContainer = styled.section`
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Question = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
`;

export const QuestionContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const QuestionChart = styled.div`
  width: 100%;
`;

export const QuestionText = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

export default function Dashboard() {
  return (
    <DashboardContainer>
      <QuestionTNO />
      <QuestionAdoption />
      <QuestionRTO />
      <QuestionIntake />
    </DashboardContainer>
  );
}
