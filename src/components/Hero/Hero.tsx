import styled from "styled-components";
import { black, blueGray } from "../../utils/color";
import { breakpoints } from "../../utils/responsive";

const HeroContainer = styled.section`
  /* Mobile first - default styles */
  min-height: 100vh;
  padding: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (min-width: ${breakpoints.tablet}) {
    padding: 24px;
    min-height: 90vh;
  }

  @media (min-width: ${breakpoints.desktop}) {
    padding: 32px;
    min-height: 100vh;
  }
`;

const HeroTitle = styled.h1`
  /* Mobile first - default styles */
  font-size: 48px;
  margin-bottom: 20px;
  color: ${black};
  text-align: center;
  letter-spacing: 0.1em;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 72px;
  }

  @media (min-width: ${breakpoints.desktop}) {
    font-size: 72px;
  }
`;

const HeroSubtitle = styled.h2`
  /* Mobile first - default styles */
  font-size: 18px;
  color: ${blueGray};
  font-weight: 200;
  text-align: center;
  letter-spacing: 0.1em;

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 24px;
  }

  @media (min-width: ${breakpoints.desktop}) {
    font-size: 20px;
  }
`;

export default function Hero() {
  return (
    <HeroContainer>
      <HeroTitle>No Kill Colorado</HeroTitle>
      <HeroSubtitle>
        Data Visualization for
        <br />
        Annual Trends of Colorado Animal Shelters
      </HeroSubtitle>
    </HeroContainer>
  );
}
