const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.url = foundDish;
    return next();
  } else {
    next({
      status: 404,
      message: `Dish Id not found: ${dishId}`,
    });
  }
}

function validPost(req, res, next) {
  const {
    data: {
      name: name,
      description: description,
      price: price,
      image_url: image_url,
    } = {},
  } = req.body;
  if (price <= 0 || Number.isInteger(price) === false) {
    next({
      status: 400,
      message: `Dish must include a price ${price}`,
    });
  } else if (name === "" || !name) {
    next({
      status: 400,
      message: `Dish must include a name ${name}`,
    });
  } else if (description === "" || !description) {
    next({
      status: 400,
      message: `Dish must include a description ${description}`,
    });
  } else if (image_url === "" || !image_url) {
    next({
      status: 400,
      message: `Dish must include a image_url ${image_url}`,
    });
  } else if (name && description && price && image_url) {
    return next();
  }
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const {
    data: {
      name: name,
      description: description,
      price: price,
      image_url: image_url,
    } = {},
  } = req.body;
  const id = nextId();
  const newDish = {
    id: id,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

function update(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const {
    data: {
      id: id,
      name: name,
      description: description,
      price: price,
      image_url: image_url,
    } = {},
  } = req.body;
  if (id != dishId) {
    if (id === undefined || id === "" || id === null || !id) {
      foundDish.name = name;
      foundDish.description = description;
      foundDish.price = price;
      foundDish.image_url = image_url;
      res.json({ data: foundDish });
    } else {
      next({
        status: 400,
        message: `Dish id does not match ${id}`,
      });
    }
  }
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;
  res.json({ data: foundDish });
}
module.exports = {
  read: [dishExists, read],
  list,
  create: [validPost, create],
  update: [dishExists, validPost, update],
};
