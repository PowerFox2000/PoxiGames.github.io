console.log("script loaded");

const canvas = document.getElementById("canvas");
console.log("canvas:", canvas);

const ctx = canvas.getContext("2d");
console.log("ctx:", ctx);

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 200, 200);
