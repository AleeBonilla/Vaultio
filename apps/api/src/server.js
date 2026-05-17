import { config } from "./config.js";
import { createApp } from "./app.js";
import { Store } from "./store.js";

const store = new Store(config.dataFile);
const server = createApp(store);

server.listen(config.port, () => {
  console.log(`Vaultio API escuchando en http://localhost:${config.port}`);
});
