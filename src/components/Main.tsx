"use client";

import classNames from "classnames";
import React, { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { Copy, Download, Loader2, Video, WandSparkles } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useChat } from "ai/react";
import Select from "./Select";

const Switcher = ({ translations }: { translations?: any }) => {
  const [topBar, setTopBar] = useState<"main" | "render" | "prompt">("main");
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [promptToCode, setPromptToCode] = useState("");
  const [codeToVideo, setCodeToVideo] = useState("");
  const [promptToCodeModel, setPromptToCodeModel] = useState("gpt-4o");
  const [promptToCodeResult, setPromptToCodeResult] = useState("");
  const [promptToCodeLoading, setPromptToCodeLoading] = useState(false);
  const [renderizationLoading, setRenderizationLoading] = useState(false);
  const [currentVideoURL, setCurrentVideoURL] = useState("");

  const handleVideoGeneration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRenderizationLoading(true);
    // Use handleCodeGeneration and handleRenderization in sequence
    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: promptToCode,
            },
          ],
        }),
      });
      const data = await response.text();
      setCodeToVideo(data);

      const response2 = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data,
        }),
      });

      const data2 = await response2.json();
      const { video_url } = data2;
      setCurrentVideoURL(video_url);
    } catch (error) {
      console.error(error);
    } finally {
      setRenderizationLoading(false);
    }
  };

  const handleRenderization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRenderizationLoading(true);
    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToVideo,
        }),
      });
      const data = await response.json();
      const { video_url } = data;
      setCurrentVideoURL(video_url);
    } catch (error) {
      console.error(error);
    } finally {
      setRenderizationLoading(false);
    }
  };

  const handleCodeGeneration = async (e: React.FormEvent<HTMLFormElement>) => {
    setPromptToCodeLoading(true);
    e.preventDefault();
    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: promptToCode,
            },
          ],
        }),
      });
      const data = await response.text();
      setPromptToCodeResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setPromptToCodeLoading(false);
    }
  };

  useEffect(() => {
    // Check if the user has a dark mode preference
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDarkMode);

    return () => {};
  }, []);

  return (
    <div className="w-full">
      <div className="w-full bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
        <button
          className={classNames(
            "p-2 w-4/12 text-sm lg:text-base rounded-lg transition",
            {
              "bg-white dark:bg-neutral-900 shadow": topBar === "main",
            }
          )}
          onClick={() => setTopBar("main")}
        >
          {translations?.generateVideo}
        </button>
        <button
          className={classNames(
            "p-2 w-4/12 text-sm lg:text-base rounded-lg transition",
            {
              "bg-white dark:bg-neutral-900 shadow": topBar === "render",
            }
          )}
          onClick={() => setTopBar("render")}
        >
          {translations?.renderEngine}
        </button>
        <button
          className={classNames(
            "p-2 w-4/12 text-sm lg:text-base rounded-lg transition",
            {
              "bg-white dark:bg-neutral-900 shadow": topBar === "prompt",
            }
          )}
          onClick={() => setTopBar("prompt")}
        >
          {translations?.promptGenerator}
        </button>
      </div>
      <div className="w-full p-6 min-h-[40vh]">
        {topBar === "main" && (
          <div className="w-full">
            <form className="w-full " onSubmit={handleVideoGeneration}>
              <label htmlFor="prompt" className="text-left">
                Make a new video
              </label>
              <div className="flex gap-x-2 mt-2">
                <Input
                  id="prompt"
                  type="text"
                  placeholder="Draw a red circle and transform it into a square"
                  className="lg:w-96"
                  value={promptToCode}
                  onChange={(e) => setPromptToCode(e.target.value)}
                />
                <Button
                  className="px-4 flex gap-x-2 items-center justify-center"
                  disabled={renderizationLoading}
                >
                  {renderizationLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  <span>
                    {renderizationLoading ? "Generating..." : "Generate"}
                  </span>
                </Button>
              </div>
            </form>
            <div className="flex gap-x-4 mt-4">
              <div className="w-6/12">
                <label htmlFor="code" className="text-left">
                  Render a video from code
                </label>
                <div className="mt-2">
                  <Editor
                    height="40vh"
                    defaultLanguage="python"
                    options={{
                      fontSize: 14,
                      wordWrap: "on",
                    }}
                    theme={isDarkMode ? "vs-dark" : "vs-light"}
                    className="border border-neutral-300 dark:border-neutral-800 rounded-lg"
                    value={codeToVideo}
                    onChange={(value) => {
                      setCodeToVideo(value || "");
                    }}
                  />
                </div>
              </div>
              <div className="w-6/12">
                <label htmlFor="code" className="text-left">
                  Video
                </label>
                <video
                  src={currentVideoURL}
                  controls
                  className="mt-2 w-full rounded-lg"
                ></video>
              </div>
            </div>
          </div>
        )}
        {topBar === "render" && (
          <div className="w-full">
            <form
              className="w-full flex gap-x-4"
              onSubmit={handleRenderization}
            >
              <div className="w-6/12">
                <label htmlFor="code" className="text-left">
                  Render a video from code
                </label>
                <div className="mt-2">
                  <Editor
                    height="40vh"
                    defaultLanguage="python"
                    options={{
                      fontSize: 14,
                      wordWrap: "on",
                    }}
                    theme={isDarkMode ? "vs-dark" : "vs-light"}
                    className="border border-neutral-300 dark:border-neutral-800 rounded-lg"
                    value={codeToVideo}
                    onChange={(value) => {
                      setCodeToVideo(value || "");
                    }}
                  />
                  <Button
                    className="px-6 flex gap-x-2 items-center justify-center mt-2"
                    disabled={renderizationLoading}
                  >
                    {renderizationLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Video />
                    )}
                    <span>
                      {renderizationLoading ? "Rendering..." : "Render"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="w-6/12">
                <label htmlFor="code" className="text-left">
                  Video
                </label>
                <video
                  src={currentVideoURL}
                  controls
                  className="mt-2 w-full rounded-lg"
                ></video>
              </div>
            </form>
          </div>
        )}
        {topBar === "prompt" && (
          <div className="w-full">
            <form className="w-full " onSubmit={handleCodeGeneration}>
              <label htmlFor="prompt" className="text-left">
                Generate code from prompt
              </label>
              <div className="flex gap-x-2 mt-2">
                <Input
                  id="prompt"
                  type="text"
                  placeholder="Draw a red circle and transform it into a square"
                  className="lg:w-96"
                  value={promptToCode}
                  onChange={(e) => setPromptToCode(e.target.value)}
                />
                <Select
                  name="model"
                  id="model"
                  value={promptToCodeModel}
                  onChange={(e) => setPromptToCodeModel(e.target.value)}
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="ft:gpt-3.5-turbo-1106:astronware:generative-manim-2:9OeVevto">
                    Fine-tuned GPT-3.5
                  </option>
                </Select>
                <Button
                  className="px-4 flex gap-x-2 items-center justify-center"
                  disabled={promptToCodeLoading}
                >
                  {promptToCodeLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  <span>
                    {promptToCodeLoading ? "Generating..." : "Generate"}
                  </span>
                </Button>
              </div>
            </form>
            <div className="mt-2">
              <Editor
                height="40vh"
                defaultLanguage="python"
                options={{
                  fontSize: 14,
                  wordWrap: "on",
                }}
                theme={isDarkMode ? "vs-dark" : "vs-light"}
                className="border border-neutral-300 dark:border-neutral-800 rounded-lg"
                value={promptToCodeResult}
                onChange={(value) => {
                  setPromptToCodeResult(value || "");
                }}
              />
              <div className="flex justify-between">
                <Button
                  className="px-6 flex gap-x-2 items-center justify-center mt-2"
                  disabled={!promptToCodeResult}
                  onClick={() => {
                    navigator.clipboard.writeText(promptToCodeResult);
                  }}
                >
                  <Copy />
                  <span>Copy</span>
                </Button>
                <Button
                  className="px-6 flex gap-x-2 items-center justify-center mt-2"
                  disabled={!promptToCodeResult}
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([promptToCodeResult], {
                      type: "text/plain",
                    });
                    element.href = URL.createObjectURL(file);
                    element.download =
                      promptToCode.toLowerCase().split(" ").join("-") + ".py";
                    document.body.appendChild(element); // Required for this to work in FireFox
                    element.click();
                    document.body.removeChild(element);
                  }}
                >
                  <Download />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Switcher;
