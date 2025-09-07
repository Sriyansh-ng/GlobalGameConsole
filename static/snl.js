document.addEventListener("DOMContentLoaded", () => {
  const canvas=document.getElementById("snlCanvas");
  if(!canvas)return;
  const ctx=canvas.getContext("2d");

  const size=40;
  let playerPos=1;
  const snakes={16:6,48:30,62:19,88:24,95:56,97:78};
  const ladders={2:38,7:14,8:31,15:26,28:84,36:44,51:67,71:91,78:98,87:94};

  function getCoords(pos){
    let row=Math.floor((pos-1)/10);
    let col=(row%2===0)?(pos-1)%10:9-(pos-1)%10;
    return {x:col*size, y:canvas.height-(row+1)*size};
  }

  function drawBoard(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let pos=1;pos<=100;pos++){
      const {x,y}=getCoords(pos);
      ctx.fillStyle="#f0f0f0";
      ctx.fillRect(x,y,size,size);
      ctx.strokeStyle="#333";
      ctx.strokeRect(x,y,size,size);
      ctx.fillStyle="#000";
      ctx.font="12px Arial";
      ctx.fillText(pos,x+2,y+12);
    }
    // ladders
    ctx.strokeStyle="green";
    ctx.lineWidth=4;
    for(let start in ladders){
      let end=ladders[start];
      let s=getCoords(parseInt(start)),e=getCoords(end);
      ctx.beginPath();
      ctx.moveTo(s.x+size/2,s.y+size/2);
      ctx.lineTo(e.x+size/2,e.y+size/2);
      ctx.stroke();
    }
    // snakes
    ctx.strokeStyle="red";
    ctx.lineWidth=4;
    for(let start in snakes){
      let end=snakes[start];
      let s=getCoords(parseInt(start)),e=getCoords(end);
      ctx.beginPath();
      ctx.moveTo(s.x+size/2,s.y+size/2);
      ctx.lineTo(e.x+size/2,e.y+size/2);
      ctx.stroke();
    }
    // player
    const {x,y}=getCoords(playerPos);
    ctx.fillStyle="gold";
    ctx.beginPath();
    ctx.arc(x+size/2,y+size/2,size/3,0,2*Math.PI);
    ctx.fill();
  }

  function movePlayer(){
    let roll=Math.floor(Math.random()*6)+1;
    const statusP=document.getElementById("snl-status");
    statusP.innerText=`You rolled a ${roll}`;
    playerPos+=roll;
    if(playerPos>100) playerPos=100;
    if(ladders[playerPos]){playerPos=ladders[playerPos]; statusP.innerText+=` 🎉 Ladder to ${playerPos}`;}
    if(snakes[playerPos]){playerPos=snakes[playerPos]; statusP.innerText+=` 🐍 Snake to ${playerPos}`;}
    drawBoard();
    if(playerPos===100){statusP.innerText="🏆 You won!"; document.getElementById("rollDice").disabled=true;}
  }

  function restartSNL(){playerPos=1;document.getElementById("rollDice").disabled=false;document.getElementById("snl-status").innerText="Click Roll Dice to start!";drawBoard();}

  document.getElementById("rollDice").addEventListener("click",movePlayer);
  window.restartSNL=restartSNL;

  drawBoard();
});
