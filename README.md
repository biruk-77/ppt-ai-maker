<div align="center">
  <a href="https://pptmakerai-seven.vercel.app">
    <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="AI-Powered Presentation Maker Banner" width="100%"/>
  </a>

  <br/>

  <h1>✨ PPT AI Maker ✨</h1>
  <p><strong>Transform simple text into professional PowerPoint presentations in seconds.</strong></p>

  <p>
    <a href="https://pptmakerai-seven.vercel.app">
      <img src="https://img.shields.io/badge/🚀_View_Live_Demo-pptmakerai--seven.vercel.app-success?style=for-the-badge&logo=vercel" alt="View Demo" />
    </a>
    <a href="https://github.com/your-username/ppt-ai-maker/issues">
      <img src="https://img.shields.io/badge/🐛_Report_Bug-Issue_Tracker-red?style=for-the-badge&logo=github" alt="Report Bug" />
    </a>
  </p>

  <p>
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg" />
    <img alt="React" src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" />
    <img alt="Gemini Engine" src="https://img.shields.io/badge/AI_Engine-Gemini_Pro-4285F4?logo=google&logoColor=white" />
  </p>
</div>

---

## 📝 Overview

**PPT AI Maker** is a next-generation presentation tool designed to eliminate the tedium of slide creation. By intelligently interpreting natural language prompts, this application constructs detailed, multi-slide presentations instantly.

Unlike standard generators, PPT AI Maker features a fully integrated **Creative Studio**, allowing you to fine-tune every aspect of your slides before exporting them to a native `.pptx` file. It bridges the gap between AI automation and human creativity.

## 🌟 Key Features

*   🧠 **Intelligent Slide Generation**: Turn a single sentence (e.g., *"A pitch deck for a fintech startup"*) into a structured presentation with outlines, bullet points, and headers.
*   ✏️ **Full-Control Creative Studio**: A robust editing environment where you can modify text, rearrange layouts, and tweak designs in real-time.
*   🖼️ **Smart Image Management**: Upload, crop, and adjust images seamlessly within the browser using the integrated Image Editor.
*   ▶️ **Live Preview Mode**: Play through your slide deck with a dynamic presentation player to ensure the flow is perfect.
*   ⬇️ **Native PPTX Export**: Download your masterpiece as a standard Microsoft PowerPoint file (`.pptx`), compatible with PowerPoint, Google Slides, and Keynote.
*   🎨 **Fluid User Experience**: Built with modern web technologies for a snappy, responsive, and animated interface.

## 🚀 Tech Stack

This project leverages a high-performance modern web stack:

*   **Core**: [React](https://react.dev/) (v18) & [TypeScript](https://www.typescriptlang.org/)
*   **Build System**: [Vite](https://vitejs.dev/)
*   **AI Engine**: [Google Gemini API](https://ai.google.dev/) (@google/genai)
*   **Export Engine**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
*   **UI/Animations**: [Framer Motion](https://www.framer.com/motion/) & Tailwind CSS

## 🏛️ Architecture Flow

Understanding how PPT AI Maker processes your data:

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App (Vite)
    participant AIService as AI Logic Layer
    participant GeminiAPI as Gemini Pro Model
    participant PPTXEngine as PptxGenJS

    User->>Frontend: Enters prompt (e.g., "History of Rome")
    Frontend->>AIService: Requests slide structure
    AIService->>GeminiAPI: Sends optimized prompt
    GeminiAPI-->>AIService: Returns JSON structured content
    AIService-->>Frontend: Renders editable slides
    User->>Frontend: Customizes text & images
    User->>Frontend: Clicks 'Export'
    Frontend->>PPTXEngine: Compiles state to .pptx
    PPTXEngine-->>User: Downloads file
