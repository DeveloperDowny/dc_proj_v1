const mongoose = require("mongoose");
const Document = require("./Document");

mongoose.connect(
  "mongodb+srv://varshil:FrTONHlYjkl3w7V4@url-shortner.bknujel.mongodb.net/url-shortner?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "https://6505-2409-40c0-5b-5f53-b9fc-7600-1f59-1241.ngrok-free.app",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
