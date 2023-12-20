if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { CronJob } = require('cron');
const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');
const router = require('./routes');
const { message } = require('./controllers/whatsapp');
const InvoiceController = require('./controllers/InvoiceController');
message();

const job = new CronJob(
	'0 0-20/1 * * *', // cronTime
	function () {
    InvoiceController.checkInvoice();
	}, // onTick
	null, // onComplete
	true, // start
	'America/Los_Angeles' // timeZone
);



app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

app.listen(port, () => {
  job.start();
  console.log(`Example app listening on port ${port}`);
});
