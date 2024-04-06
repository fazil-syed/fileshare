(function () {
  let senderId;
  const socket = io();
  function generateId() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
      Math.random() * 999
    )}-${Math.trunc(Math.random() * 999)}`;
  }

  document
    .querySelector("#receiver-start-conn-btn")
    .addEventListener("click", function () {
      senderId = document.querySelector("#join-id").value;
      if (senderId.length === 0) return;
      let joinId = generateId();
      socket.emit("receiver-join", {
        uid: joinId,
        sender_uid: senderId,
      });
      document.querySelector(".join-screen").classList.remove("active");
      document.querySelector(".fs-screen").classList.add("active");
    });
  let fileShare = {};
  socket.on("fs-meta", function (metadata) {
    fileShare.metadata = metadata;
    fileShare.transmitted = 0;
    fileShare.buffer = [];
    let el = document.createElement("div");
    el.classList.add("item");
    el.innerHTML = `
        <div class="progress">0%</div>
        <div class="filename">${metadata.filename}</div>
        `;
    document.querySelector(".files-list").appendChild(el);

    fileShare.progress_node = el.querySelector(".progress");
    socket.emit("fs-start", {
      uid: senderId,
    });
  });
  socket.on("fs-share", function (buffer) {
    fileShare.buffer.push(buffer);
    fileShare.transmitted += buffer.byteLength;
    fileShare.progress_node.innerText =
      Math.trunc(
        (fileShare.transmitted / fileShare.metadata.total_buffer_size) * 100
      ) + "%";
    if (fileShare.transmitted === fileShare.metadata.total_buffer_size) {
      download(new Blob(fileShare.buffer), fileShare.metadata.filename);
      fileShare = {};
    } else {
      socket.emit("fs-start", {
        uid: senderId,
      });
    }
  });
})();
