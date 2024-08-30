import React, { useRef, useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

function App() {
    const [predictions, setPredictions] = useState([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const modelRef = useRef(null);

    const handleStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
        };

        const model = await cocoSsd.load();
        modelRef.current = model;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        setInterval(async () => {
            if (!modelRef.current) return;

            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // detect objects
            const predictions = await modelRef.current.detect(video);
            setPredictions(predictions);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            predictions.forEach(prediction => {
                const { bbox, class: className, score } = prediction;
                ctx.beginPath();
                ctx.rect(bbox[0], bbox[1], bbox[2], bbox[3]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.fillStyle = 'red';
                ctx.stroke();
                ctx.fillText(`${className} (${Math.round(score * 100)}%)`, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
            });
        }, 1000); 
    };

    useEffect(() => {
        handleStream();
    }, []);

    return (
        <div className="App">
            <video ref={videoRef} width="640" height="480" autoPlay muted style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} width="640" height="480"></canvas>
            <div>
                {predictions.map((pred, index) => (
                    <div key={index}>
                        <p>Class: {pred.class}</p>
                        <p>Probability: {pred.score}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
