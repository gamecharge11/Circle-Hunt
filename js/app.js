document.getElementById("play").onclick = () => {
  document.body.style.cursor = "url(./Assets/cursor/cursor.cur),auto";
  document.getElementById("menu").style.display = "none";
  document.getElementById("canvas").style.display = "block";
  main();
};
