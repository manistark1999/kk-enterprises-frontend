const express = require("express");
const router = express.Router();
const { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomersSummary
} = require("../controllers/customerController");

router.route("/summary").get(getCustomersSummary);

router.route("/")
  .get(getCustomers)
  .post(createCustomer);

router.route("/:id")
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
