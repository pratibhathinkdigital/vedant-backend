const app = require('./server.js');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Passenger: Server listening on port ' + PORT);
});
