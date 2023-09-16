import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

$(document).ready(function(){

    $('#audioFile').change(function(e){
        const audioFile = e.target.files[0];
        initPlayer(audioFile)
        processAudioFile(audioFile);
    });
    var canvas = document.getElementById("canvas");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.translate(0, canvas.offsetHeight/2); // Set Y = 0 to be in the middle of the canvas
    drawOrigin(ctx);


    // functions --------
    function initPlayer(audioFile){
        const audio = document.getElementById("audio");
        const audioSrc = document.getElementById("audioSrc");
         // Create a blob that we can use as an src for our audio element
        const urlObj = URL.createObjectURL(audioFile);
        audio.addEventListener("load", () => {
            URL.revokeObjectURL(urlObj);
        });
        audioSrc.src = urlObj;
        audio.load();
    }
    function processAudioFile(file){
        const reader = new FileReader();
        alert("loaed")

        reader.onloadend = (event)=>{
            const content = new Uint8Array(event.target.result);
            const chunkId = content.slice(0,4);
            const format = content.slice(8,12);
            const sampleRate = convert2int(content.slice(24,28));
            const chunk2Id = content.slice(36,40);
            const bitsPerSample = convert2int(content.slice(34,36));
            const audioSamples = content.slice(44,content.length);
            const channelNumber = convert2int(content.slice(22,24));
            const audioLengthInSec = Math.round(  ((audioSamples.length/(bitsPerSample/8))/sampleRate) / channelNumber );

            console.log("chunk id:",chunkId,"format:",format, "sample rate:",sampleRate, "chunk 2id:",chunk2Id)
            drawHistogram(audioSamples, channelNumber, bitsPerSample, sampleRate, audioLengthInSec)    
        }
        reader.readAsArrayBuffer(file);
    }
    function drawHistogram(audioSamples, channelNumber, bitsPerSample, sampleRate, audioLengthInSec){
        const spaceBetweenLines = 2.1;
        const bytesPerSample = bitsPerSample/8;
        const samplesToTake = 4000;
        let currentLineX = 0;
        const scaler = 0.3;

        // canvas related calculations 
        const bars =(canvas.width/2);
        const incremntValue =Math.floor( audioSamples.length / bars);
        const samplesToDraw = [];
        for(let i =0; i < bars; i++){
            const blockStart = i*incremntValue;
            const index = Math.floor(Math.random() * ((blockStart+incremntValue) - blockStart + 1) + blockStart);
            const sample = audioSamples[index]*scaler;
            samplesToDraw.push( sample );
        }

        for(let i =0; i < samplesToDraw.length; i++){
            drawLineSegment(ctx, currentLineX, -1*samplesToDraw[i]);
            drawLineSegment(ctx, currentLineX, samplesToDraw[i]);
            currentLineX += spaceBetweenLines;
        }
        drawOrigin(ctx);
    }
    function drawOrigin (ctx){
        ctx.lineWidth = 1; // how thick the line is
        ctx.strokeStyle = "#f00"; // what color our line is
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1200, 0);
        ctx.stroke();
    };
    function drawLineSegment (ctx, x, y) {
        ctx.lineWidth = 1; // how thick the line is
        ctx.strokeStyle = "#4d4d4d"; // what color our line is
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
    };
    function clear (ctx, canvas){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function byte2string(array) {
        var result = "";
        for (var i = 0; i < array.length; i++) {
          result += String.fromCharCode(array[i]);
        }
        return result;
    }
    function convert2int(Uint8Arr) {
        var length = Uint8Arr.length;
        let buffer =  Buffer.from(Uint8Arr);
        // var result = buffer.readInt8(0, length);
        var result = buffer.readUIntLE(0, length);
        return result;
    }
    function mapToRange (num, in_min, in_max, out_min, out_max) {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
    
});

