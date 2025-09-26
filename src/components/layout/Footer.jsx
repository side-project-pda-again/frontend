import React from "react";
import githubMark from "@assets/images/github-mark.svg";

export default function Footer() {
  return (
    <div className="flex justify-between bg-gray-100 p-4 items-center">
      <div />
      <div className="text-gray-500">@copyright 2025 pdaAgain</div>
      <div>
        <a href="https://github.com/side-project-pda-again">
          <img src={githubMark} alt="GitHub" className="w-8 h-8" />
        </a>
      </div>
    </div>
  );
}
