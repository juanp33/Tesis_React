import React, { useState, useEffect, useMemo } from "react";
import MasterPage from "./MasterPage";
import "./TranscripcionPage.css";
import { jsPDF } from "jspdf";

const TranscripcionPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState<string>("");
  const [speakerMap, setSpeakerMap] = useState<{ [key: string]: string }>({});
  const [buttonText, setButtonText] = useState("Transcribir");
  const [dotCount, setDotCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://localhost:8000/transcribir_diarizado/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.conversacion) {
        setRawText(data.conversacion); // ✅ ya es string
      }
    } catch (error) {
      alert("Error al transcribir el archivo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const matches = Array.from(new Set(rawText.match(/SPEAKER_\d+/g) || [])) as string[];
    const initialMap: { [key: string]: string } = {};
    matches.forEach((s) => (initialMap[s] = s));
    setSpeakerMap(initialMap);
  }, [rawText]);

  const handleSpeakerChange = (originalName: string, newName: string) => {
    setSpeakerMap((prev) => ({
      ...prev,
      [originalName]: newName,
    }));
  };

  const renderedText = useMemo(() => {
    let output = rawText;
    Object.entries(speakerMap).forEach(([original, custom]) => {
      const regex = new RegExp(`\\b${original}\\b`, "g");
      output = output.replace(regex, custom);
    });
    return output;
  }, [rawText, speakerMap]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 10;

    const lines = renderedText.split("\n");

    lines.forEach((line) => {
      const wrappedLines: string[] = doc.splitTextToSize(line, 180);
      wrappedLines.forEach((wrappedLine: string) => {
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 10;
        }
        doc.text(wrappedLine, 10, y);
        y += 10;
      });
    });

    doc.save("transcripcion.pdf");
  };

  useEffect(() => {
    if (!loading) {
      setButtonText("Transcribir");
      return;
    }

    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setButtonText("Transcribiendo" + ".".repeat(dotCount));
    }
  }, [dotCount, loading]);

  return (
    <MasterPage>
      <div className="transcripcion-layout">
        <div className="panel-contenedor">
          <div className="transcripcion-controls">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <button onClick={handleTranscribe} disabled={loading}>
              {buttonText}
            </button>

            {Object.entries(speakerMap).map(([original, current], index) => (
              <div key={index} style={{ marginTop: "10px", width: "100%" }}>
                <label>{original}: </label>
                <input
                  type="text"
                  value={current}
                  onChange={(e) => handleSpeakerChange(original, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="transcripcion-output">
            <textarea
              className="transcripcion-textarea"
              value={renderedText}
              readOnly
            ></textarea>

            <button className="exportar-btn" onClick={handleExportPDF}>
              EXPORTAR
            </button>
          </div>
        </div>
      </div>
    </MasterPage>
  );
};

export default TranscripcionPage;
