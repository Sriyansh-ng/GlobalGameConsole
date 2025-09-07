document.addEventListener("DOMContentLoaded",()=>{
  const boardDiv=document.getElementById("ttt-board");
  const statusP=document.getElementById("ttt-status");
  let board=["","","","","","","","",""];
  let currentPlayer="X";

  function drawBoard(){
    boardDiv.innerHTML="";
    board.forEach((cell,i)=>{
      const div=document.createElement("div");
      div.innerText=cell;
      div.addEventListener("click",()=>makeMove(i));
      boardDiv.appendChild(div);
    });
  }

  function checkWinner(){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){
      if(board[a]&&board[a]===board[b]&&board[a]===board[c]) return board[a];
    }
    return board.includes("")?null:"Draw";
  }

  function makeMove(i){
    if(board[i]||checkWinner()) return;
    board[i]=currentPlayer;
    currentPlayer=currentPlayer==="X"?"O":"X";
    drawBoard();
    const winner=checkWinner();
    if(winner) statusP.innerText=winner==="Draw"?"It's a Draw!":winner+" won!";
  }

  function restartTTT(){board=["","","","","","","","",""];currentPlayer="X";statusP.innerText="";drawBoard();}
  window.restartTTT=restartTTT;
  drawBoard();
});
