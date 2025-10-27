import styled from "styled-components";
import { useEffect, useState } from "react";

import AdoptionChart from "./AdoptionChart";
import { QuestionTitle } from "../../common/title";
import { Description } from "../../common/text";

import {
  getAdoptionData,
  getCountyAdoptionData,
} from "../../../utils/dataProcessing/adoptionData";
import { breakpoints } from "../../../utils/responsive";

import type {
  AdoptionData,
  AdoptionProcessedData,
} from "../../../utils/dataProcessing/adoptionData";
import MiniAdoptionChart from "./MiniAdoptionChart";

import AdoptionLegend from "../../../utils/img/Adoption_legend.png";

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

export default function QuestionAdoption() {
  const [data, setData] = useState<AdoptionProcessedData | null>(null);
  const [countyData, setCountyData] = useState<
    {
      county: string;
      data: {
        total: AdoptionData;
        dog: AdoptionData;
        cat: AdoptionData;
      };
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const totalData = await getAdoptionData();
      const countyData = await getCountyAdoptionData();
      setData(totalData);
      setCountyData(countyData);
    };
    fetchData();
  }, []);
  return (
    <Question>
      <QuestionTitle>Adoption</QuestionTitle>
      <RowContainer>
        <HalfContainer>
          <Description>
            Track adoption numbers year to year, both as raw totals and as a
            percentage of total intake.
          </Description>
          <Description>
            The adoption rate (the proportion of animals adopted out of the
            total intake) increased to 71% in 2020, but has been declining since
            then.
          </Description>
          <Description>
            The total number of adopted animals also appears to have been
            fluctuating since 2018.
          </Description>
          <Description>
            By county (sorted in descending order of adoption rate in 2024),
            counties such as Elbert, San Miguel, Broomfield, and Larimer showed
            values close to 100%.
          </Description>
          <Description style={{ fontSize: "13px", marginTop: "20px" }}>
            (analyzed only the 26 counties with available data, and some
            facilities may have been omitted during the ZIP code conversion
            process.)
          </Description>
          <img
            src={AdoptionLegend}
            alt="RTO Rate Legend"
            style={{ width: "100%", maxWidth: "600px", marginTop: "40px" }}
          />
        </HalfContainer>
        <HalfContainer>
          <AdoptionChart data={data} />
        </HalfContainer>
      </RowContainer>
      <CountyContainer>
        {countyData.map((countyEntry) => {
          return (
            <MiniAdoptionChart
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
