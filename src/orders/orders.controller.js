const path = require("path");
const dishesController = require("../dishes/dishes.controller");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.url = foundOrder;
    return next();
  } else {
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
}

function validPost(req, res, next) {
  if (
    req.body.data.dishes === undefined ||
    req.body.data.dishes.length === 0 ||
    Array.isArray(req.body.data.dishes) === false
  ) {
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  if (req.body.data.dishes != undefined) {
    const dishes = req.body.data.dishes;
    let quantity;
    dishes.forEach((dish) => {
      if (
        dish.quantity > 0 &&
        Number.isInteger(dish.quantity) === true &&
        dish.quantity != undefined
      ) {
        quantity = dish.quantity;
      } else if (
        dish.quantity === 0 ||
        Number.isInteger(dish.quantity) === false ||
        dish.quantity === undefined
      ) {
        next({
          status: 400,
          message: `Order must include a quantity that is an integer greater than 0 ${quantity}`,
        });
      }
    });
  }
  const {
    data: { deliverTo: deliverTo, mobileNumber: mobileNumber, dishes: [] } = {},
  } = req.body;
  if (deliverTo === "" || !deliverTo) {
    next({
      status: 400,
      message: `Order must include a deliverTo ${deliverTo}`,
    });
  } else if (mobileNumber === "" || !mobileNumber) {
    next({
      status: 400,
      message: `Order must include a mobileNumber ${mobileNumber}`,
    });
  } else if (deliverTo && mobileNumber) {
    return next();
  }
}

function validPut(req, res, next) {
  if (
    req.body.data.dishes === undefined ||
    req.body.data.dishes.length === 0 ||
    Array.isArray(req.body.data.dishes) === false
  ) {
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  if (req.body.data.dishes != undefined) {
    const dishes = req.body.data.dishes;
    let quantity;
    dishes.forEach((dish) => {
      if (
        dish.quantity > 0 &&
        Number.isInteger(dish.quantity) === true &&
        dish.quantity != undefined
      ) {
        quantity = dish.quantity;
      } else if (
        dish.quantity === 0 ||
        Number.isInteger(dish.quantity) === false ||
        dish.quantity === undefined
      ) {
        next({
          status: 400,
          message: `Order must include a quantity that is an integer greater than 0 ${quantity}`,
        });
      }
    });
  }
  const {
    data: {
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: [],
    } = {},
  } = req.body;
  if (deliverTo === "" || !deliverTo) {
    next({
      status: 400,
      message: `Order must include a deliverTo ${deliverTo}`,
    });
  } else if (mobileNumber === "" || !mobileNumber) {
    next({
      status: 400,
      message: `Order must include a mobileNumber ${mobileNumber}`,
    });
  } else if (
    req.body.data.dishes.length === 0 ||
    req.body.data.dishes === undefined ||
    Array.isArray(req.body.data.dishes) === false
  ) {
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  } else if (status === "" || !status || status === "invalid") {
    next({
      status: 400,
      message: `Order must include a status ${status}`,
    });
  } else if (deliverTo && mobileNumber && status) {
    return next();
  }
}

function list(req, res) {
  res.json({ data: orders });
}

function read(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.json({ data: foundOrder });
}

function update(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  const {
    data: {
      id: id,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: [{}],
    } = {},
  } = req.body;
  if (orderId != id) {
    if (id === undefined || id === "" || id === null || !id) {
      foundOrder.deliverTo = deliverTo;
      foundOrder.mobileNumber = mobileNumber;
      foundOrder.status = status;
      res.json({ data: foundOrder });
    } else {
      next({
        status: 400,
        message: `Order id does not match ${id}`,
      });
    }
  }
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  res.json({ data: foundOrder });
}

function create(req, res, next) {
  const {
    data: {
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: [
        {
          id: dishId,
          name: name,
          description: description,
          image_url: image_url,
          price: price,
          quantity: quantity,
        },
      ],
    } = {},
  } = req.body;
  const id = nextId();
  const newOrder = {
    id: id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: [
      {
        id: dishId,
        name: name,
        description: description,
        image_url: image_url,
        price: price,
        quantity: quantity,
      },
    ],
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;
  if (orderId) {
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder.status === "pending") {
      const index = orders.findIndex((order) => (order.id = orderId));
      if (index > -1) {
        orders.splice(index, 1);
      }
    } else {
      next({
        status: 400,
        message: `An order canot be deleted unless it is pending`,
      });
    }
  } else {
    res.sendStatus(400);
  }
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  update: [orderExists, validPut, update],
  create: [validPost, create],
  delete: [orderExists, destroy],
};
