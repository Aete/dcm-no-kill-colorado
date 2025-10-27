import styled from "styled-components";
import { ChapterTitle } from "../common/title";
import { breakpoints } from "../../utils/responsive";
import { Description } from "../common/text";

const OverviewContainer = styled.section`
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px;
  @media (min-width: ${breakpoints.tablet}) {
    flex-direction: row;
    gap: 40px;
  }
`;

const HalfContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  @media (min-width: ${breakpoints.tablet}) {
    width: 50%;
  }
`;

const BoldLink = styled.a`
  font-weight: bold;
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Overview() {
  return (
    <OverviewContainer>
      <Content>
        <HalfContainer>
          <ChapterTitle>Overview</ChapterTitle>
          <Description style={{ marginBottom: "10px" }}>
            This project was carried out through a collaboration between <br />
            <BoldLink
              href="https://www.datachangemakers.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Data Changemaker
            </BoldLink>{" "}
            and{" "}
            <BoldLink
              href="https://www.nokillcolorado.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              No Kill Colorado
            </BoldLink>
            .
          </Description>
          <Description style={{ marginBottom: "10px" }}>
            Volunteers contributed by processing and visualizing data, helping
            to transform complex information into meaningful insights that
            support community-driven change.
          </Description>
          <Description>
            The goal of this project is to identify and track trends across
            multiple years of Colorado shelter statistics. By understanding the
            patterns in intake, outcomes, transfers, and community impacts, we
            can better encourage, define, and support the programs and services
            that will help every healthy and treatable pet find a safe outcome.
          </Description>
        </HalfContainer>
        <HalfContainer>
          <img src="/overview.png" alt="Overview Illustration" />
        </HalfContainer>
      </Content>
    </OverviewContainer>
  );
}
