require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app')

connectDB();

const port = process.env.PORT || 5001;   
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
