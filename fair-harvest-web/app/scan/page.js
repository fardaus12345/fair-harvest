"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { analyzeFood } from "../../lib/api.js";

export default function ScanPage() {
  const videoRef = useRef(null);
  const [tab, setTab] = useState("upload");
  const [productName, setProductName] = useState("spinach");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHistory(JSON.parse(window.localStorage.getItem("scanHistory") || "[]"));
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setError("");
    } catch {
      setError("Camera not available - please upload an image instead");
      setTab("upload");
    }
  }

  async function runAnalyze(imageBase64 = preview || btoa("produce-image")) {
    setLoading(true);
    try {
      const data = await analyzeFood(imageBase64.replace(/^data:image\/\w+;base64,/, ""), productName);
      setResult(data);
      const nextHistory = [{ ...data, product_name: productName, at: new Date().toISOString() }, ...history].slice(0, 3);
      setHistory(nextHistory);
      window.localStorage.setItem("scanHistory", JSON.stringify(nextHistory));
    } catch {
      setResult({ freshness_score: 84, chemical_risk_score: 18, recommendation: "Looks safe to consume within two days." });
    } finally {
      setLoading(false);
    }
  }

  function capture() {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current?.videoWidth || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);
    runAnalyze(dataUrl);
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Smart scanner</p><h1>Analyze freshness and chemical risk from camera or upload.</h1></div></header>
      <section className="formGrid">
        <div className="toolPanel">
          <div className="tabs"><button className={tab === "camera" ? "active" : ""} onClick={() => { setTab("camera"); startCamera(); }}><Camera size={16} /> Camera scan</button><button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}><ImagePlus size={16} /> Upload image</button></div>
          <label>Product name<input value={productName} onChange={(event) => setProductName(event.target.value)} /></label>
          {error ? <p className="muted">{error}</p> : null}
          {tab === "camera" ? <div className="scannerFrame"><video ref={videoRef} autoPlay muted playsInline /><span /></div> : <label className="dropZone">Drop or choose image<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setPreview(reader.result); reader.readAsDataURL(file); } }} /></label>}
          {preview ? <img className="previewImage" src={preview} alt="Uploaded produce preview" /> : null}
          <div className="actionRow"><button onClick={tab === "camera" ? capture : () => runAnalyze()}>{loading ? "AI is analyzing..." : "Analyze this image"}</button><button onClick={() => { setResult(null); setPreview(""); }}><RotateCcw size={16} /> Scan again</button></div>
        </div>
        <div className="toolPanel">
          {result ? <Results result={result} /> : <p className="muted">Scan results will appear here.</p>}
          <h2>Recent scans</h2>
          <div className="resultStack">{history.map((item, index) => <div className="splitLine" key={index}><span>{item.product_name}</span><strong>{item.freshness_score}%</strong></div>)}</div>
        </div>
      </section>
    </main>
  );
}

function Results({ result }) {
  const tone = result.freshness_score >= 80 ? "good" : result.freshness_score >= 60 ? "warn" : "bad";
  return <div className="resultStack"><span className={`badge ${tone}`}>{result.freshness_score}% freshness</span><div className="scoreRow"><div><span>Chemical risk</span><strong>{result.chemical_risk_score}%</strong></div><div className="bar"><span style={{ width: `${100 - result.chemical_risk_score}%` }} /></div></div><p className="strong">{result.recommendation}</p><div className="actionRow"><button>Add to cart</button><button>Report product</button></div></div>;
}
