import styled from "styled-components";
import Dashboard from "./components/Dashboard/Dashboard";
import Hero from "./components/Hero/Hero";
import Overview from "./components/Overview/Overview";

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

function App() {
  return (
    <AppContainer>
      <Hero />
      <Overview />
      <Dashboard />
    </AppContainer>
  );
}

export default App;
