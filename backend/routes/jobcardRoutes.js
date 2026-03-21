const express = require("express");
const router = express.Router();
const {
  createJobcard,
  getAllJobcards,
  updateJobcard,
  deleteJobcard,
  getNextJobcardNo
} = require("../controllers/jobcardController");

router.get("/next-number", getNextJobcardNo);

router.route("/")
  .post(createJobcard)
  .get(getAllJobcards);

router.route("/:id")
  .put(updateJobcard)
  .delete(deleteJobcard);

module.exports = router;
