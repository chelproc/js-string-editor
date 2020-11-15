import React, { useEffect, useState } from "react";
import Sval from "sval";
import "./App.css";
import { MonacoEditor } from "./components/editor";
import { Grid, Header, Segment, Message } from "semantic-ui-react";
import stringify from "json-stringify-pretty-compact";

type Application = {
  title: string;
  inputs: ApplicationInput[];
  code: string;
};
type ApplicationInput = {
  id: string;
  type: "plain" | "json";
};

const application: Application = JSON.parse(
  decodeURIComponent(window.location.hash.substr(1))
);

function App() {
  const [inputs, setInputs] = useState<{ id: string; value: string }[]>([]);
  const [results, setResults] = useState<
    { id: string; value: string; language: string }[] | Error
  >([]);

  useEffect(() => {
    const sval = new Sval();
    try {
      for (const applicationInput of application.inputs) {
        const targetInput = inputs.find(
          (input) => input.id === applicationInput.id
        );
        const valueRepresentation =
          applicationInput.type === "plain"
            ? JSON.stringify(targetInput?.value ?? "")
            : JSON.stringify(JSON.parse(targetInput?.value ?? ""));
        sval.run(`const ${applicationInput.id} = ${valueRepresentation};`);
      }
      sval.run(application.code);
      setResults(
        Object.entries(sval.exports).map(([key, value]) => ({
          id: key,
          language: "plain",
          value: typeof value === "string" ? value : stringify(value),
        }))
      );
    } catch (e) {
      setResults(e);
    }
  }, [inputs]);

  return (
    <>
      <Header as="h1">{application.title}</Header>
      <Grid>
        <Grid.Column width="8">
          <Header as="h2">入力</Header>
          {application.inputs.map((applicationInput) => (
            <Segment key={applicationInput.id}>
              <Header as="h3">{applicationInput.id}</Header>
              <MonacoEditor
                disableTabKey
                value={
                  inputs.find((input) => input.id === applicationInput.id)
                    ?.value ?? ""
                }
                onChange={(value) => {
                  setInputs((oldInputs) => [
                    ...oldInputs.filter(
                      (oldInput) => oldInput.id !== applicationInput.id
                    ),
                    { id: applicationInput.id, value },
                  ]);
                }}
                language={applicationInput.type}
              />
            </Segment>
          ))}
        </Grid.Column>
        <Grid.Column width="8">
          <Header as="h2">出力</Header>
          {Array.isArray(results) ? (
            results.map((result) => (
              <Segment key={result.id}>
                <Header as="h3">{result.id}</Header>
                <MonacoEditor
                  enableLineNumbers
                  language={result.language}
                  value={result.value}
                />
              </Segment>
            ))
          ) : (
            <Message negative header={results.name} content={results.message} />
          )}
        </Grid.Column>
      </Grid>
    </>
  );
}

export default App;
