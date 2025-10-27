import RTOChart from "./RTOChart";
import type { RTOProcessedData, RTOData } from "./graph/RTO";
import { useEffect, useState } from "react";
import {
  getCountyRTOData,
  getRTOData,
} from "../../../utils/dataProcessing/rtoData";
import { QuestionTitle } from "../../common/title";
import { Description } from "../../common/text";
import styled from "styled-components";
import { breakpoints } from "../../../utils/responsive";
import MiniRTOChart from "./MiniRTOChart";

import RTOLegend from "../../../utils/img/rto_legend.png";

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

export default function QuestionRTO() {
  const [data, setData] = useState<RTOProcessedData | null>(null);
  const [countyData, setCountyData] = useState<
    {
      county: string;
      data: {
        total: RTOData;
        dog: RTOData;
        cat: RTOData;
      };
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const totalData = await getRTOData();
      const countyRTOData = await getCountyRTOData();
      setData(totalData);
      setCountyData(countyRTOData);
    };
    fetchData();
  }, []);
  return (
    <Question>
      <QuestionTitle>Return to Owner (RTO)</QuestionTitle>
      <RowContainer>
        <HalfContainer>
          <Description>
            RTO (Return to Owner) is the share of stray or lost pets reunited
            with their owners—higher is better for community engagement and
            shelter practices.
          </Description>
          <Description>
            Since 2020, returns have risen by ~4,000, but overall stray counts
            and the RTO rate have decreased little.
          </Description>
          <Description>
            By county (sorted by RTO rate), Gunnison and Grand reunite 90%+ of
            strays, while Denver, Jefferson, and Adams each return 1,000+
            animals annually.
          </Description>
          <Description style={{ fontSize: "13px", marginTop: "20px" }}>
            (analyzed only the 31 counties with available data, and some
            facilities may have been omitted during the ZIP code conversion
            process.)
          </Description>
          <img
            src={RTOLegend}
            alt="RTO Rate Legend"
            style={{ width: "100%", maxWidth: "600px", marginTop: "40px" }}
          />
        </HalfContainer>
        <HalfContainer>
          <RTOChart data={data} />
        </HalfContainer>
      </RowContainer>
      <CountyContainer>
        {countyData.map((countyEntry) => {
          return (
            <MiniRTOChart
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
