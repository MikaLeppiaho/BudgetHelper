const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
//API routerit
const dailyBudgetRouter = require("./controllers/dailybudgets");
const budgetSettingsRouter = require("./controllers/budgetsettings");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const expensesRouter = require("./controllers/expenses");
const CronJob = require("./utils/scheduledtask");

logger.info("Connecting to", config.MONGODBURI);

//Yhdistä MongoDB
getConnection = async () => {
  try {
    await mongoose.connect(config.MONGODBURI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connection to database succesfull`);
  } catch (err) {
    console.log(`Connection to database failed ${config.MONGODBURI}`);
  }
};
getConnection();

CronJob.start();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
//REST Endpointit
app.use("/api/dailybudget", dailyBudgetRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/budgetsettings", budgetSettingsRouter);
app.use("/api/expenses", expensesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
