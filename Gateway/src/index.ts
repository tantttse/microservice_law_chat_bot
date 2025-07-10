import express from 'express';
import runApp from './app';

const app = express();
runApp(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
