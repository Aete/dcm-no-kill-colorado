import styled from "styled-components";
import { useEffect, useState } from "react";

import { QuestionTitle } from "../../common/title";
import { Description } from "../../common/text";
import { breakpoints } from "../../../utils/responsive";
import {
  getTNODataTotal,
  getCountyTNOData,
} from "../../../utils/dataProcessing/tnoData";
import TNOChart from "./TNOChart";
import type {
  TNOData,
  TNOProcessedData,
} from "../../../utils/dataProcessing/tnoData";
import MiniTNOChart from "./MiniTNOChart";

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

export default function QuestionTNO() {
  const [data, setData] = useState<TNOProcessedData | null>(null);
  const [countyData, setCountyData] = useState<
    {
      county: string;
      data: {
        total: TNOData;
        dog: TNOData;
        cat: TNOData;
      };
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const tnoData = await getTNODataTotal();
      const countyTNOData = await getCountyTNOData();
      setData(tnoData);
      setCountyData(countyTNOData);
      console.log(countyTNOData.length);
    };
    fetchData();
  }, []);

  return (
    <Question>
      <QuestionTitle>Transfers vs. Negative Outcomes</QuestionTitle>
      <RowContainer>
        <HalfContainer>
          <Description>
            Compare the number of pets transferred into Colorado shelters from
            other states to the number of pets who do not leave shelters alive
            (euthanasia, died, or missing).
          </Description>
          <Description>
            Across Colorado, transfers from other states have been decreasing
            since 2020. However, negative outcomes rose up to 2023 and then
            decreased in 2024.
          </Description>
          <Description style={{ fontSize: "13px", marginTop: "20px" }}>
            (analyzed only the 26 counties with available data, and some
            facilities may have been omitted during the ZIP code conversion
            process. Blank cells indicate that data are unavailable for the
            given year.)
          </Description>
        </HalfContainer>
        <HalfContainer>
          <TNOChart data={data} />
        </HalfContainer>
      </RowContainer>
      <CountyContainer>
        {countyData.map((countyEntry) => {
          return (
            <MiniTNOChart
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
