import styled from "styled-components";
import { black, blueGray } from "../../utils/color";
import { breakpoints } from "../../utils/responsive";

export const ChapterTitle = styled.h2`
  /* Mobile first - default styles */
  width: 100%;
  font-size: 24px;
  margin-bottom: 20px;
  color: ${black};
  letter-spacing: 0.05em;
  text-align: left;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 32px;
    margin-bottom: 32px;
  }
  @media (min-width: ${breakpoints.desktop}) {
    font-size: 42px;
  }
`;

export const QuestionTitle = styled.h4`
  font-size: 20px;
  width: 100%;
  color: ${blueGray};
  letter-spacing: 0.05em;
  text-align: left;
  font-weight: 700;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 24px;
    margin-bottom: 28px;
  }
`;

export const ChartTitle = styled.h4`
  font-size: 16px;
  width: 100%;
  color: ${blueGray};
  letter-spacing: 0.05em;
  text-align: left;
  font-weight: 700;
  margin-left: 10px;
  margin-bottom: 20px;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 20px;
    margin-bottom: 28px;
  }
`;

export const CountyTitle = styled.h4`
  font-size: 14px;
  width: 100%;
  color: ${blueGray};
  letter-spacing: 0.05em;
  text-align: left;
  font-weight: 700;
  margin-bottom: 8px;
  margin-left: 10px;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 16px;
  }
`;
