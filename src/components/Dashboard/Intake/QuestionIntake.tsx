import styled from "styled-components";
import { useEffect, useState } from "react";

import { QuestionTitle } from "../../common/title";
import { Description } from "../../common/text";
import { breakpoints } from "../../../utils/responsive";
import {
  getIntakeDataTotal,
  getCountyIntakeData,
} from "../../../utils/dataProcessing/intakeData";
import IntakeChart from "./IntakeChart";
import type { IntakeProcessedData } from "../../../utils/dataProcessing/intakeData";
import MiniIntakeChart from "./MiniIntakeChart";

const Question = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 80px;
  width: 100%;
  margin-bottom: 80px;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.desktop}) {
    flex-direction: column;
  }
`;

const HalfContainer = styled.div`
  flex: 1;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;

  @media (max-width: ${breakpoints.desktop}) {
    width: 100%;
  }
`;

const CountyContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 80px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export default function QuestionIntake() {
  const [data, setData] = useState<IntakeProcessedData | null>(null);
  const [countyData, setCountyData] = useState<
    {
      county: string;
      data: IntakeProcessedData;
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const intakeData = await getIntakeDataTotal();
      const countyIntakeData = await getCountyIntakeData();
      setData(intakeData);
      setCountyData(countyIntakeData);
      console.log(countyIntakeData.length);
    };
    fetchData();
  }, []);

  return (
    <Question>
      <QuestionTitle>Intake Categories</QuestionTitle>
      <RowContainer>
        <HalfContainer>
          <Description>
            Monitor proportions of stray intake, owner relinquishments, and the
            other intake sources.
          </Description>
          <Description>
            Identify whether owner surrenders are increasing or decreasing, and
            whether economic or social factors correlate with those shifts.
          </Description>
          <Description>
            Across Colorado, both stray and relinquishment numbers appear to
            have increased since 2020.
          </Description>
          <Description style={{ fontSize: "13px", marginTop: "20px" }}>
            (analyzed only 38 counties with available data, and some facilities
            may have been omitted during the ZIP code conversion process. Blank
            cells indicate that data are unavailable for the given year.)
          </Description>
        </HalfContainer>
        <HalfContainer>
          <IntakeChart data={data} />
        </HalfContainer>
      </RowContainer>
      <CountyContainer>
        {countyData.map((countyEntry) => {
          return (
            <MiniIntakeChart
              key={countyEntry.county}
              title={countyEntry.county}
              data={countyEntry.data}
            />
          );
        })}
      </CountyContainer>
    </Question>
  );
}
