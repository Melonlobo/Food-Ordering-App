const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./connection');
const bodyParser = require('body-parser');
const { MenuDb, CartDb } = require('./model');
const path = require('path');

const server = express();

dotenv.config({ path: 'config.env' });
const PORT = process.env.PORT || 8000;

connectDB();

server.use(bodyParser.urlencoded({ extended: true }));

server.use(express.static(path.resolve(__dirname, 'assets')));

server.use(express.json());

server.get('/menu', (req, res) => {
	MenuDb.find()
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			console.error(err.message);
		});
});

server.get('/orders', (req, res) => {
	CartDb.find()
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			console.error(err.message);
		});
});

server.get('/*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'assets', 'home.html'));
});

server.post('/api/cart', (req, res) => {
	if (req.body.length > 0) {
		req.body.forEach((item) => {
			CartDb.find({ item: item[0] })
				.then((data) => {
					if (data.length > 0) {
						if (item[1] <= 0) {
							CartDb.deleteOne({ item: item[0] }).catch((err) =>
								console.error(err.message)
							);
						} else {
							CartDb.findOneAndUpdate({ item: item[0] }, { quantity: item[1] })
								.catch((err) => {
									console.error(err.message);
								})
						}
					} else if (item[1] > 0) {
						const cart = new CartDb({
							item: item[0],
							quantity: item[1],
						});
						cart
							.save(cart)
							.catch((err) => console.error(err.message))
					}
				})
				.catch((err) => {
					console.error(err.message);
				});
		});
	}
});

server.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
