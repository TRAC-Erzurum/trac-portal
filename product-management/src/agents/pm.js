import fs from "fs";
import { ChatOllama } from "@langchain/ollama";

const prompt = fs.readFileSync("./src/prompts/pm.txt", "utf8");

const model = new ChatOllama({
  model: "llama3",
  temperature: 0
});

export async function runPM(input, context = "") {
  const res = await model.invoke([
    { role: "system", content: prompt },
    { role: "assistant", content: context },
    { role: "user", content: input }
  ]);

  return res.content;
}
