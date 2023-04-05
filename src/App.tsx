import styled from "styled-components";
import Editor from "./Editor";

function App() {
  return (
    <AppLayout>
      <MainContainer>
        <Editor />
      </MainContainer>
    </AppLayout>
  );
}

const AppLayout = styled.div(() => {
  return {
    display: "flex",
    justifyContent: "center",
    // alignItems: "center",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "green",
  };
});

const MainContainer = styled.div(() => {
  return {
    width: "100%",
    padding: "0px 20%",
    marginTop: "20px",
  };
});

export default App;
