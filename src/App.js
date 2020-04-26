import React from 'react';
import logo from './logo.svg';
import './App.css';
import { flagMapping } from './FlagMapping';
const tf = require('@tensorflow/tfjs');
const buildPath = (true) ? "http://localhost:3000/FlagCNN"  : "https://TivsLThree.github.io/FlagCNN/";
class App extends React.Component {
  constructor(){
    super()
        this.state = {guess: "Start drawing a flag and I'll try to guess it!"};
  }
  componentWillUnmount() {

  }
componentDidMount() {
  this.loadModel();
    //this.guess = null;
    this.old = "";
    this.bool = false;
    this.canvas = false; this.ctx = false; this.flag = false;
        this.prevX = 0;
        this.currX = 0;
        this.prevY = 0;
        this.currY = 0;
        this.dot_flag = false;
        this.boxSize = 40;
    this.x = "white";
        this.y = 2;
    this.model = null;
    this.weights = null;
    this.canvas = document.getElementById('can');
    this.ctx = this.canvas.getContext("2d");

    this.canvas2 = document.getElementById('can2');
    this.ctx2 = this.canvas2.getContext("2d");
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.ctx.fillStyle = "rgba(255,255,255,255)";
    this.ctx.fillRect(0,0,this.w,this.h);
    this.ctx2.fillStyle = "rgba(255,255,255,255)";
    this.ctx2.fillRect(0,0,this.w,this.h);
    this.canvas.addEventListener('mousedown', this.handleClick);
    this.canvas.addEventListener('mouseup', this.handleRelease)
    this.canvas.addEventListener('mousemove', this.draw);
    this.canvas.addEventListener('mouseout', this.handleRelease);
    this.canvas2.addEventListener('mouseup', this.pickColor)
    this.canvas2.addEventListener('mousedown', this.pickColor)

    var x = this.canvas2.width / 2;
    var y = this.canvas2.height / 2;
    var radius = 32;
    var counterClockwise = false;

    for(var angle=0; angle<=360; angle+=1){
      var startAngle = (angle-2)*Math.PI/180;
      var endAngle = angle * Math.PI/180;
      this.ctx2.beginPath();
      this.ctx2.moveTo(x, y);
      this.ctx2.arc(x, y, radius, startAngle, endAngle, counterClockwise);
      this.ctx2.closePath();
      this.ctx2.fillStyle = 'hsl('+angle+', 100%, 50%)';
      this.ctx2.fill();
    }
  }

  pickColor = (e) =>
  {
    var pd = this.ctx2.getImageData(e.offsetX, e.offsetY, 1, 1).data;
    this.x = `rgba(${pd[0]},${pd[1]},${pd[2]},255)`
  }

  handleClick =(e)=> {
    if(e.button == 2)
    {
      this.old = this.x;
      this.x = `rgba(255,255,255,255)`
    }
    if(e.shiftKey && e.button != 2)
    {
      var pd = this.ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
      this.x = `rgba(${pd[0]},${pd[1]},${pd[2]},255)`
    } else {
       this.bool = true
    }
   // console.log(e)
  }
  handleRelease =(e) =>{
    if(e.button == 2)
    {
      this.x = this.old;
    }
    this.bool = false;
    var res = null;
    if(this.model != null)
    {
      var img = new Image(this.canvas.toDataURL("image/png"));
      this.ctx.drawImage(img, 0,0);
      var imgData = this.ctx.getImageData(0,0,this.w,this.h);
      //console.log(imgData.data[0])
      img = tf.browser.fromPixels(imgData).resizeBilinear([23,13])
      img = img.reshape([1,13,23,3])
      res = this.model.predict(img)
      var guess = res.dataSync();
      console.log(guess);
      var index = guess.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

      console.log(flagMapping[index].name)
     this.setState({guess:flagMapping[index].name});
    }
  }
  draw=(e) => {
    if(!this.bool)
     return;
    this.ctx.fillStyle = this.x;
    this.ctx.fillRect(Math.floor(e.offsetX / this.boxSize) * this.boxSize,
      Math.floor(e.offsetY / this.boxSize) * this.boxSize,
      this.boxSize, this.boxSize);
  }
  //   <div style="position:absolute;top:20%;left:83%;">Eraser</div>
async loadModel() {
  var path = buildPath + "/resources/model/model.json";
  this.model = await tf.loadLayersModel(path);
}
render () {

  return (
    <div className="App" onLoad = {this.load}>
    <canvas id="can" width="920" height="520" onContextMenu={(e) => e.preventDefault()} style={{position:"absolute",top:"8%",left:"10%",border:"2px solid"}}></canvas>
    <div>{this.state.guess}</div>
    <canvas id="can2" width="64" height="64" onContextMenu={(e) => e.preventDefault()} style={{position:"absolute",top:"8%",left:"90%",border:"2px solid"}}></canvas>

    <div style={{position:"absolute",top:"15%",left:"83%"}}>Choose Color, Right click to erase.

      <p>Shift-click on a color on the canvas to color pick it, or just click on the color wheel!</p></div>
    </div>
  );
}
}

export default App;
