"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export default function useSpeechAnalyzer(targetText) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [results, setResults] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [liveWordResults, setLiveWordResults] = useState([]);
    const recognitionRef = useRef(null);

    const targetWords = useMemo(() => 
        targetText ? targetText.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")) : []
    , [targetText]);

    // Live tracking
    useEffect(() => {
        if (!targetText) {
            setLiveWordResults([]);
            return;
        }
        const cleanTargetWords = targetWords.map(w => w.toLowerCase());
        const spokenWords = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);

        let targetIdx = 0;
        let spokenIdx = 0;
        let currentResults = targetText.split(/\s+/).map(w => ({ word: w, status: 'pending' }));

        while (targetIdx < cleanTargetWords.length && spokenIdx < spokenWords.length) {
            const tWord = cleanTargetWords[targetIdx];
            const sWord = spokenWords[spokenIdx];

            if (tWord === sWord) {
                currentResults[targetIdx].status = 'correct';
                targetIdx++;
                spokenIdx++;
            } else {
                const lookaheadIndex = cleanTargetWords.findIndex((w, idx) => idx > targetIdx && idx <= targetIdx + 3 && w === sWord);
                if (lookaheadIndex !== -1) {
                    for (let i = targetIdx; i < lookaheadIndex; i++) {
                        currentResults[i].status = 'skipped';
                    }
                    currentResults[lookaheadIndex].status = 'correct';
                    targetIdx = lookaheadIndex + 1;
                    spokenIdx++;
                } else {
                    // It's a substitution or mispronunciation for the current target word
                    if (currentResults[targetIdx].status === 'pending' || currentResults[targetIdx].status === 'current') {
                        currentResults[targetIdx].status = 'substitution';
                        currentResults[targetIdx].spokenWord = sWord;
                    }
                    spokenIdx++;
                }
            }
        }
        
        if (targetIdx < currentResults.length) {
            currentResults[targetIdx].status = 'current';
        }

        setLiveWordResults(currentResults);
    }, [transcript, targetText, targetWords]);

    const startRecording = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
            setTimeLeft(Math.max(10, Math.ceil(targetWords.length * 2.0))); // At least 10s, or 2.0s per word
        };
        
        recognition.onend = () => setIsRecording(false);

        recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [targetWords]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const analyze = useCallback(() => {
        if (!targetText) return;

        // Count correct
        let matches = 0;
        const finalWordResults = [...liveWordResults];
        
        for (let i = 0; i < finalWordResults.length; i++) {
            if (finalWordResults[i].status === 'correct') {
                matches++;
            } else if (finalWordResults[i].status === 'skipped') {
                // Keep as Omission
            } else if (finalWordResults[i].status === 'substitution') {
                // Keep as Substitution
            } else {
                finalWordResults[i].status = 'wrong'; // Never reached or matched
            }
        }

        const accuracy = Math.round((matches / targetWords.length) * 100) || 0;

        // Dynamic fluency calculation based on accuracy, word count, and elapsed time
        const wordCount = targetWords.length;
        const durationSec = elapsedTime || 1;
        const rawFluency = (accuracy * wordCount) / durationSec;
        const fluencyScore = Math.min(100, Math.round(rawFluency));

        setResults({
            accuracy,
            fluencyScore,
            wordResults: finalWordResults,
            originalText: targetText,
            spokenText: transcript,
            duration: elapsedTime
        });
        
    }, [transcript, targetText, targetWords, liveWordResults, elapsedTime]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        if (isRecording && timeLeft <= 0 && transcript !== "") {
            // Auto-submit when time is perfectly 0 or below, but only if recording was active
            // and we didn't just clear the transcript
            stopRecording();
            analyze();
        }
    }, [isRecording, timeLeft, stopRecording, analyze, transcript]);

    return {
        isRecording,
        transcript,
        results,
        timeLeft,
        elapsedTime,
        liveWordResults,
        targetWords,
        startRecording,
        stopRecording,
        analyze,
        setTranscript,
        setResults,
        setElapsedTime
    };
}
