const app = require("./app.js");

// port
const port = process.env.PORT || 8000;

// node server
app.listen(port, () => {
  console.log(
    "server running at http://localhost:%d",
    port
  );
  console.log(" Press CTRL-C to stop\n")
});
