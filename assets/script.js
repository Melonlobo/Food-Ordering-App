'use strict';
const home = document.querySelector('.home');
const navbar = document.querySelector('.navbar');
const search = document.querySelector('#search');
const totalItems = document.querySelectorAll('.total');
const group = document.querySelector('.search-group');
const hamburger = document.querySelector('.hamburger');
const user = document.querySelector('.user');
const filterSort = document.querySelector('.filter-sort');
const container = document.querySelector('.container');
const ul = document.createElement('ul');
const cards = document.createElement('div');
const cartDisplay = document.querySelector('.cart');
const goBack = document.querySelector('.go-back');
const filterCard = document.querySelector('.filter');
const cartDetails = document.querySelector('.order-details');
cards.classList.add('cards');
container.append(cards);
const catagoriesList = document.createElement('div');
catagoriesList.classList.add('catagories');
container.append(catagoriesList);
ul.classList.add('suggestions');
group.append(ul);
let menu;
const arr = [];
const catagories = [];
const cart = new Map();
let searchPaths = [];

document.onDOMContentLoaded = (() => {
	fetch('/menu')
		.then((res) => res.json())
		.then((data) => (menu = data))
		.then(() => {
			menu.forEach((item) => {
				if (!arr.includes(item.catagory.toLowerCase())) {
					arr.push(item.catagory.toLowerCase());
					catagories.push([item.catagory, item.imgSrc]);
				}
			});
		})
		.then(() => {
			createCatagories();
		})
		.catch((err) => console.error(`${err.message} menu`))
		.then(() => {
			fetch('/orders')
				.then((res) => {
					res
						.json()
						.then((data) => {
							data.forEach((item) => {
								cart.set(item.item.toLowerCase(), item.quantity);
							});
						})
						.then(() => cartTotal())
						.then(() => {
							router();
						});
				})
				.catch((err) => console.error(`${err.message} cart`));
		});
})();

navbar.addEventListener('click', (e) => {
	if (e.target.matches('.search-btn')) {
		e.preventDefault();
		if (menu && search.value.trim()) {
			searchPaths.push(search.value.toLowerCase().trim());
			cards.innerHTML = '';
			cardList.length = 0;
			menu.forEach((item) => {
				if (
					item.item.toLowerCase().includes(search.value.toLowerCase().trim())
				) {
					itemCard(item);
					cardList.push(item);
				} else if (
					search.value.toLowerCase().trim() === item.catagory.toLowerCase()
				) {
					itemCard(item);
					cardList.push(item);
				} else if (
					search.value.toLowerCase().trim() === item.foodType.toLowerCase()
				) {
					itemCard(item);
					cardList.push(item);
				}
			});
			ul.style.overflowY = 'hidden';
			ul.innerHTML = '';
			history.pushState(
				search.value.trim(),
				search.value.trim(),
				search.value.trim()
			);
			search.value = '';
			cards.scrollIntoView();
			createFilterList();
		}
	} else if (e.target.matches('#cart')) {
		showCart();
		history.pushState(null, null, 'cart');
	} else if (e.target.matches('#sort')) {
		if (e.target.value === 'none') return;
		const itemsArr = [];
		const numsArr = [];
		let reverseTheArr = false;

		cards.querySelectorAll('.card-title').forEach((item) => {
			itemsArr.push(item.innerText);
		});

		if (e.target.value === 'rating') {
			cards.querySelectorAll('.rating').forEach((rating) => {
				numsArr.push(parseInt(rating.innerText[rating.innerText.length - 1]));
			});
		} else if (
			e.target.value === 'price-high-low' ||
			e.target.value === 'price-low-high'
		) {
			if (e.target.value === 'price-low-high') {
				reverseTheArr = true;
			}
			cards.querySelectorAll('.price').forEach((price) => {
				numsArr.push(parseInt(price.innerText.slice(8, -1)));
			});
		} else if (
			e.target.value === 'cal-high-low' ||
			e.target.value === 'cal-low-high'
		) {
			if (e.target.value === 'cal-low-high') {
				reverseTheArr = true;
			}
			cards.querySelectorAll('.calories').forEach((calories) => {
				numsArr.push(parseInt(calories.innerText.slice(18)));
			});
		}
		sortingFunc(itemsArr, numsArr, reverseTheArr);
	} else if (e.target.matches('#filter')) {
		e.stopPropagation();
		if (!filterCard.hasChildNodes()) return;
		filterCard.classList.toggle('hidden');
	}
});

hamburger.addEventListener('click', () => {
	hamburger.firstChild.classList.toggle('one-cross');
	hamburger.children[1].classList.toggle('hidden');
	hamburger.lastChild.classList.toggle('three-cross');
	user.classList.toggle('inactive');
	filterSort.classList.toggle('inactive');
});

function showCart() {
	const subTotals = [];
	cartDetails.innerHTML = '';
	cart.forEach((qty, item) => {
		menu.find((food) => {
			if (food.item.toLowerCase() === item.toLowerCase()) {
				createCart(food);
				if (food.availability) {
					subTotals.push(food.price * qty);
				}
			}
		});
	});
	totalPrice(subTotals);
	if (!cart.size) {
		cartDetails.innerText = 'Your cart is Empty...';
	}
	home.classList.add('hidden');
	cartDisplay.classList.remove('hidden');
}

goBack.addEventListener('click', () => {
	cartDisplay.classList.add('hidden');
	home.classList.remove('hidden');
	history.back();
});

function createCatagories() {
	catagories.forEach((item) => {
		const catagoryDiv = document.createElement('div');
		const catagoryName = document.createElement('h3');
		catagoryName.classList.add('catagory-name');
		const img = document.createElement('img');
		img.classList.add('catagory-img');
		catagoryName.innerText = item[0];
		img.src = item[1];
		catagoryDiv.append(img, catagoryName);
		catagoriesList.append(catagoryDiv);
	});
}

function suggestionsDebounce(fn, d) {
	let timer;
	return function () {
		const args = [...arguments];
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn(args[0]);
		}, d);
	}.bind(this);
}

let suggestionsList = suggestionsDebounce(suggestions, 300);

search.addEventListener('keyup', () => {
	suggestionsList(search.value.toLowerCase().trim());
});

function suggestions(query) {
	if (ul.hasChildNodes() || !menu) {
		ul.innerHTML = '';
	}
	if (menu) {
		menu.forEach((item) => {
			if (item.item.toLowerCase().includes(query)) {
				const itemDiv = document.createElement('div');
				itemDiv.classList.add('item-div');
				const itemName = document.createElement('li');
				itemName.classList.add('item-name');
				const img = document.createElement('img');
				img.classList.add('item-icon');
				itemName.innerText = item.item;
				img.src = item.imgSrc;
				itemDiv.append(img, itemName);
				ul.append(itemDiv);
			}
		});
	}
	if (ul.clientHeight < ul.scrollHeight) {
		ul.style.overflowY = 'scroll';
	} else {
		ul.style.overflowY = 'hidden';
	}
	if (!query) {
		ul.style.overflowY = 'hidden';
		ul.innerHTML = '';
	}
}

ul.addEventListener('click', (e) => {
	ul.style.overflowY = 'hidden';
	ul.innerHTML = '';
	cards.innerHTML = '';
	cardList.length = 0;
	menu.forEach((item) => {
		if (e.target.innerText.toLowerCase() === item.item.toLowerCase()) {
			search.value = item.item;
			itemCard(item);
			cardList.push(item);
			cards.scrollIntoView();
			history.pushState(item.item, item.item, item.item);
		}
	});
	createFilterList();
});

const checkedItems = new Set();
const cardList = [];
filterCard.addEventListener('click', (e) => {
	e.stopPropagation();
	const filterItems = [];
	const filterValues = [];
	let value;
	cards.querySelectorAll('.card-title').forEach((title) => {
		filterItems.push(title.innerText);
	});
	if (e.target.checked) {
		checkedItems.add(e.target.id);
		value = e.target.id;
		if (e.target.id === 'ratings') {
			cards.querySelectorAll('.rating').forEach((rating) => {
				filterValues.push(parseInt(rating.innerText.slice(-1)));
			});
		} else if (value) {
			cards.querySelectorAll('.item-card').forEach((card) => {
				filterValues.push(card.getAttribute('foodType'));
			});
		}
		filteringFunc(filterItems, filterValues, value);
	} else if (!e.target.checked && e.target.id) {
		checkedItems.delete(e.target.id);
		unfilterFunc(e.target.id);
	}
});

catagoriesList.addEventListener('click', (e) => {
	if (e.target.matches('.catagory-img')) {
		cards.innerHTML = '';
		cardList.length = 0;
		menu.forEach((item) => {
			if (
				e.target.nextSibling.innerText.toLowerCase() ===
				item.catagory.toLowerCase()
			) {
				itemCard(item);
				cardList.push(item);
			}
		});
		history.pushState(null, null, e.target.nextSibling.innerText.toLowerCase());
		cards.scrollIntoView();
		createFilterList();
	} else if (e.target.matches('.catagory-name')) {
		cards.innerHTML = '';
		cardList.length = 0;
		menu.forEach((item) => {
			if (e.target.innerText.toLowerCase() === item.catagory.toLowerCase()) {
				itemCard(item);
				cardList.push(item);
			}
		});
		history.pushState(null, null, e.target.innerText.toLowerCase());
		cards.scrollIntoView();
		createFilterList();
	}
});

function itemCard(item) {
	const card = document.createElement('div');
	card.classList.add('item-card');
	card.setAttribute('foodType', item.foodType);
	const imageDiv = document.createElement('div');
	imageDiv.className = 'card-image-div';
	const image = document.createElement('img');
	image.className = 'card-image';
	image.src = item.imgSrc;
	imageDiv.append(image);
	const info = document.createElement('div');
	info.className = 'card-info';
	const title = document.createElement('span');
	title.className = 'card-title';
	title.innerText = item.item;
	const rating = document.createElement('span');
	rating.className = 'rating';
	rating.innerText = `Rating : ${item.rating}`;
	const availability = document.createElement('span');
	availability.className = 'availability';
	availability.innerText = 'Currently Unavailable';
	const addItem = document.createElement('div');
	if (!item.availability) {
		availability.style.display = 'block';
	} else {
		availability.style.display = 'none';
		addItem.className = 'add-item';
		const minus = document.createElement('button');
		minus.innerText = '-';
		minus.className = 'minus';
		const addText = document.createElement('span');
		addText.innerText = cart.get(item.item.toLowerCase()) || 'Add Item';
		const plus = document.createElement('button');
		plus.innerText = '+';
		plus.className = 'plus';
		addItem.append(minus, addText, plus);
	}
	const calories = document.createElement('span');
	calories.className = 'calories';
	calories.innerText = `Calories/serving : ${item.totalCalories}`;
	const price = document.createElement('span');
	price.className = 'price';
	price.innerText = `Price : ${item.price} ₹`;
	const cuisine = document.createElement('span');
	cuisine.className = 'cuisine';
	cuisine.innerText = `Cuisine : ${item.cuisineType}`;
	const availableAt = document.createElement('span');
	availableAt.className = 'available-at';
	availableAt.innerText = `${item.restaurant}, ${item.place}`;
	info.append(
		title,
		cuisine,
		availableAt,
		rating,
		calories,
		price,
		availability,
		addItem
	);
	card.append(imageDiv, info);
	cards.append(card);
}

cards.addEventListener('click', (e) => {
	const item = e.target.parentElement.parentElement.firstChild.innerText;
	if (e.target.matches('.minus')) {
		cartAction(item, '-');
		if (cart.get(item.toLowerCase())) {
			e.target.nextSibling.innerText = cart.get(item.toLowerCase());
		} else {
			e.target.nextSibling.innerText = 'Add Item';
		}
	} else if (e.target.matches('.plus')) {
		cartAction(item, '+');
		e.target.previousSibling.innerText = cart.get(item.toLowerCase());
	}
});

function createFilterList(c = true) {
	filterCard.innerHTML = '';
	let foodTypes = [];
	const foodTypeNodes = cards.querySelectorAll('.item-card');
	foodTypeNodes.forEach((foodType) => {
		foodTypes.push(foodType.getAttribute('foodType'));
	});
	foodTypes = [...new Set(foodTypes)];
	const ratings = document.createElement('div');
	const ratingsCheckbox = document.createElement('input');
	ratingsCheckbox.setAttribute('type', 'checkbox');
	ratingsCheckbox.setAttribute('id', 'ratings');
	ratingsCheckbox.setAttribute('name', 'ratings');
	const ratingsLabel = document.createElement('label');
	ratingsLabel.setAttribute('for', 'ratings');
	ratingsLabel.innerText = 'Ratings 3+';
	ratings.append(ratingsCheckbox, ratingsLabel);
	filterCard.append(ratings);
	foodTypes.forEach((foodType) => {
		const filterDiv = document.createElement('div');
		const checkbox = document.createElement('input');
		checkbox.setAttribute('type', 'checkbox');
		checkbox.setAttribute('id', foodType);
		checkbox.setAttribute('name', foodType);
		const label = document.createElement('label');
		label.setAttribute('for', foodType);
		label.innerText = foodType;
		filterDiv.append(checkbox, label);
		filterCard.append(filterDiv);
	});
	if (c) {
		checkedItems.clear();
	}
}

const subCart = [];

function cartAction(item, action) {
	const newArr = [];
	if (cart.has(item.toLowerCase())) {
		switch (action) {
			case '-':
				cart.set(item.toLowerCase(), cart.get(item.toLowerCase()) - 1);
				newArr.push(item.toLowerCase(), cart.get(item.toLowerCase()));
				break;
			case '+':
				cart.set(item.toLowerCase(), cart.get(item.toLowerCase()) + 1);
				newArr.push(item.toLowerCase(), cart.get(item.toLowerCase()));
				break;
			case 'delete':
				cart.set(item.toLowerCase(), 0);
				newArr.push(item.toLowerCase(), cart.get(item.toLowerCase()));
				break;
		}
		if (cart.get(item.toLowerCase()) <= 0) {
			cart.delete(item.toLowerCase());
		}
	} else if (!cart.has(item.toLowerCase()) && action === '+') {
		cart.set(item.toLowerCase(), 1);
		newArr.push(item.toLowerCase(), 1);
	}
	if (newArr.length) {
		subCart.push(newArr);
	}
	if (subCart.length) {
		itemsAddition(subCart);
	}
	cartTotal();
	if (!cart.size) {
		cartDetails.innerText = 'Your cart is Empty...';
	}
}

function debounceCart(fn, d) {
	let timer;
	return function () {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const newCart = new Map(arguments[0]);
			const newArr = Array.from(newCart);
			fn(newArr);
			subCart.length = 0;
		}, d);
	};
}

let itemsAddition = debounceCart(myOrder, 3000);

function myOrder(myCart) {
	fetch('/api/cart', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(myCart),
	}).catch((err) => console.error(`${err.message} your orders`));
}

function cartTotal() {
	const a = Array.from(cart.values()).reduce((acc, n) => {
		return acc + n;
	}, 0);
	totalItems.forEach((item) => (item.innerText = `${a} Cart`));
}

function createCart(item) {
	const card = document.createElement('div');
	card.classList.add('cart-item-card');
	const imageDiv = document.createElement('div');
	imageDiv.className = 'cart-card-image-div';
	const image = document.createElement('img');
	image.className = 'cart-card-image';
	image.src = item.imgSrc;
	imageDiv.append(image);
	const info = document.createElement('div');
	info.className = 'cart-card-info';
	const foodInfo = document.createElement('div');
	foodInfo.className = 'food-info';
	const priceInfo = document.createElement('div');
	priceInfo.className = 'price-info';
	const title = document.createElement('h3');
	title.className = 'card-title';
	title.innerText = item.item;
	const availability = document.createElement('div');
	availability.className = 'availability';
	availability.innerText = 'Currently Unavailable';
	const addItem = document.createElement('div');
	const subTotal = document.createElement('div');
	const currency = document.createElement('p');
	currency.innerText = '₹';
	currency.className = 'currency';
	const qty = document.createElement('p');
	if (!item.availability) {
		availability.style.display = 'block';
		qty.innerText = `Qty : ${cart.get(item.item.toLowerCase())}`;
	} else {
		availability.style.display = 'none';
		addItem.className = 'cart-add-item';
		const minus = document.createElement('button');
		if (cart.get(item.item.toLowerCase()) === 1) {
			minus.innerText = 'x';
		} else if (cart.get(item.item.toLowerCase()) > 1) {
			minus.innerText = '-';
		}
		minus.className = 'minus';
		const addText = document.createElement('p');
		addText.innerText = cart.get(item.item.toLowerCase());
		const plus = document.createElement('button');
		plus.innerText = '+';
		plus.className = 'plus';
		addItem.append(minus, addText, plus);
		subTotal.className = 'sub-total';
		const subTotalText = document.createElement('p');
		subTotalText.innerText = 'Sub-Total :';
		subTotalText.className = 'sub-total-text';
		const subTotalCurrency = document.createElement('div');
		subTotalCurrency.className = 'sub-total-currency';
		const subTotalPrice = document.createElement('p');
		subTotalPrice.innerText = item.price * cart.get(item.item.toLowerCase());
		subTotalPrice.className = 'sub-total-price';
		const currency = document.createElement('p');
		currency.innerText = '₹';
		currency.className = 'currency';
		subTotalCurrency.append(subTotalPrice, currency);
		subTotal.append(subTotalText, subTotalCurrency);
	}
	const price = document.createElement('div');
	price.className = 'cart-price';
	const priceText = document.createElement('p');
	priceText.className = 'price-text';
	priceText.innerText = 'Price :';
	const priceNum = document.createElement('p');
	priceNum.className = 'price-num';
	priceNum.innerText = item.price;
	price.append(priceText, priceNum, currency);
	const cuisine = document.createElement('p');
	cuisine.className = 'cuisine';
	cuisine.innerText = `Cuisine : ${item.cuisineType}`;
	const availableAt = document.createElement('p');
	availableAt.className = 'available-at';
	availableAt.innerText = `${item.restaurant},
	${item.place}, Mangalore - ${item.PINcode}`;
	const deleteItem = document.createElement('button');
	deleteItem.innerText = 'DELETE';
	deleteItem.className = 'delete';
	foodInfo.append(title, cuisine, availableAt);
	priceInfo.append(price, qty, addItem, deleteItem, availability);
	info.append(foodInfo, priceInfo, subTotal);
	card.append(imageDiv, info);
	cartDetails.append(card);
}

cartDetails.addEventListener('click', (e) => {
	const priceNum =
		e.target.parentElement.parentElement.parentElement.querySelector(
			'.price-num'
		).innerText;
	if (e.target.matches('.minus')) {
		const item =
			e.target.parentElement.parentElement.previousSibling.firstChild.innerText;
		cartAction(item, '-');
		e.target.parentElement.parentElement.parentElement.parentElement.querySelector(
			'.sub-total-price'
		).innerText = priceNum * cart.get(item.toLowerCase());
		if (e.target.innerText === 'x') {
			e.target.parentElement.parentElement.parentElement.parentElement.remove();
		}
		if (cart.get(item.toLowerCase())) {
			e.target.nextSibling.innerText = cart.get(item.toLowerCase());
			if (cart.get(item.toLowerCase()) === 1) {
				e.target.innerText = 'x';
			}
		}
	} else if (e.target.matches('.plus')) {
		const item =
			e.target.parentElement.parentElement.previousSibling.firstChild.innerText;
		cartAction(item, '+');
		e.target.parentElement.parentElement.parentElement.parentElement.querySelector(
			'.sub-total-price'
		).innerText = priceNum * cart.get(item.toLowerCase());
		e.target.previousSibling.innerText = cart.get(item.toLowerCase());
		if (e.target.previousSibling.previousSibling.innerText === 'x') {
			e.target.previousSibling.previousSibling.innerText = '-';
		}
	} else if (e.target.matches('.delete')) {
		cartAction(
			e.target.parentElement.previousSibling.firstChild.innerText,
			'delete'
		);
		e.target.parentElement.parentElement.parentElement.remove();
	}
	if (e.target.matches('.minus, .plus, .delete')) {
		const subTotals = [];
		const subTotalElements = document.querySelectorAll('.sub-total-price');
		subTotalElements.forEach((price) => {
			subTotals.push(parseInt(price.innerText));
		});
		totalPrice(subTotals);
	}
});

function totalPrice(items) {
	const priceDisplay = document.querySelector('.total-price');
	const grandTotal = items.reduce((acc, price) => {
		return acc + price;
	}, 0);
	priceDisplay.innerText = `Total : ${grandTotal} ₹`;
}

function sortingFunc(itemsArr, numsArr, rev) {
	const sorting = new Map();
	const sorted = new Map();

	for (let i = 0; i < itemsArr.length; i++) {
		sorting.set(itemsArr[i], numsArr[i]);
	}
	const sortedArr = numsArr.sort((a, b) => b - a);

	if (rev) {
		sortedArr.reverse();
	}
	while (sortedArr.length) {
		sorting.forEach((qty, item) => {
			if (sorting.get(item) === sortedArr[0]) {
				sorted.set(item, sortedArr[0]);
				sorting.delete(item);
				sortedArr.shift();
			}
		});
	}
	cards.innerHTML = '';
	sorted.forEach((qty, item) => {
		menu.find((food) => {
			if (food.item.toLowerCase() === item.toLowerCase()) {
				itemCard(food);
			}
		});
	});
	createFilterList();
}

function filteringFunc(items, values, value) {
	cards.innerHTML = '';
	const filteredItems = new Map();

	for (let i = 0; i < items.length; i++) {
		filteredItems.set(items[i], values[i]);
	}
	if (value === 'ratings') {
		filteredItems.forEach((num, item) => {
			if (num < 3) {
				filteredItems.delete(item);
			}
		});
	} else {
		filteredItems.forEach((type, item) => {
			if (type !== value) {
				filteredItems.delete(item);
			}
		});
	}
	filteredItems.forEach((val, title) => {
		menu.find((item) => {
			if (title.toLowerCase() === item.item.toLowerCase()) {
				itemCard(item);
			}
		});
	});
	createFilterList(false);
	checkFilters();
}

function unfilterFunc(type) {
	if (type === 'ratings') {
		cardList.forEach((item) => {
			if (item.rating < 3 && checkedItems.has(item.foodType)) {
				itemCard(item);
			} else if (
				item.rating < 3 &&
				!filterCard.querySelector('#ratings').parentElement.nextSibling
					.firstChild.checked
			) {
				itemCard(item);
			}
		});
	} else {
		cardList.forEach((item) => {
			if (
				item.foodType !== type &&
				!filterCard.querySelector('#ratings').checked
			) {
				itemCard(item);
			} else if (
				item.foodType !== type &&
				filterCard.querySelector('#ratings').checked &&
				item.rating >= 3
			) {
				itemCard(item);
			}
		});
	}
	createFilterList(false);
	checkFilters();
}

function checkFilters() {
	if (checkedItems.size) {
		checkedItems.forEach((item) => {
			filterCard.querySelectorAll('input').forEach((type) => {
				if (item === type.id) {
					type.checked = true;
				}
			});
		});
	}
}
home.addEventListener('click', (e) => {
	if (
		!filterCard.classList.contains('hidden') &&
		!filterCard.contains(e.target)
	) {
		filterCard.classList.add('hidden');
	}
});

function router() {
	const routes = [{ path: '/' }, { path: '/cart' }];

	searchPaths = [...new Set(searchPaths)];

	if (searchPaths.length) {
		searchPaths.forEach((searchPath) => {
			routes.forEach((route) => {
				if (`/${searchPath}` === route.path) return;
				routes.push({ path: `/${searchPath.toLowerCase().trim()}` });
			});
		});
	}

	if (
		history.state &&
		!searchPaths.includes(history.state.toLowerCase().trim())
	) {
		routes.push({ path: `/${history.state}` });
		searchPaths.push(history.state.toLowerCase().trim());
	}

	catagories.forEach((item) => {
		routes.push({ path: `/${item[0].toLowerCase()}` });
	});

	menu.forEach((item) => {
		routes.push({ path: `/${item.foodType.toLowerCase()}` });
	});

	menu.forEach((item) => {
		routes.push({ path: `/${item.item.toLowerCase()}` });
	});

	const potentialMatches = routes.map((route) => {
		return {
			route: route,
			result:
				decodeURIComponent(location.pathname).toLowerCase().trim() ===
				route.path.toLowerCase(),
		};
	});

	const matchFound = potentialMatches.find(
		(potentialMatch) => potentialMatch.result
	);

	if (!matchFound) return;

	const index = searchPaths.indexOf(
		matchFound.route.path.slice(1).toLowerCase().trim()
	);

	history.scrollRestoration = 'manual';

	if (!matchFound.route.path) return;

	switch (matchFound.route.path) {
		case '/':
			cartDisplay.classList.add('hidden');
			home.classList.remove('hidden');
			cards.innerHTML = '';
			cardList.length = 0;
			search.value = '';
			filterCard.innerHTML = '';
			filterCard.classList.add('hidden');
			navbar.scrollIntoView();
			user.classList.add('inactive');
			filterSort.classList.add('inactive');
			break;
		case '/cart':
			showCart();
			cartDisplay.scrollIntoView();
			break;
		case `/${searchPaths[index]}`:
			home.classList.remove('hidden');
			cartDisplay.classList.add('hidden');
			cards.innerHTML = '';
			cardList.length = 0;
			search.value = history.state;
			user.classList.add('inactive');
			filterSort.classList.add('inactive');
			menu.forEach((item) => {
				if (item.item.toLowerCase().includes(searchPaths[index])) {
					itemCard(item);
					cardList.push(item);
				} else if (
					matchFound.route.path.slice(1) === item.catagory.toLowerCase()
				) {
					itemCard(item);
					cardList.push(item);
				} else if (
					matchFound.route.path.slice(1) === item.foodType.toLowerCase()
				) {
					itemCard(item);
					cardList.push(item);
				}
			});
			search.blur();
			navbar.scrollIntoView();
			createFilterList();
			break;
		case decodeURIComponent(location.pathname.toLowerCase()):
			cartDisplay.classList.add('hidden');
			home.classList.remove('hidden');
			cards.innerHTML = '';
			cardList.length = 0;
			search.value = '';
			user.classList.add('inactive');
			filterSort.classList.add('inactive');
			menu.forEach((item) => {
				if (matchFound.route.path.slice(1) === item.catagory.toLowerCase()) {
					itemCard(item);
					cardList.push(item);
				} else if (
					matchFound.route.path.slice(1) === item.foodType.toLowerCase()
				) {
					itemCard(item);
					cardList.push(item);
				} else if (matchFound.route.path.slice(1) === item.item.toLowerCase()) {
					itemCard(item);
					cardList.push(item);
				}
			});
			cards.scrollIntoView();
			createFilterList();
			break;
		default:
			break;
	}
}

window.addEventListener('popstate', router);
