require("dotenv").config();
const app = require("./src/app");
const { sequelize } = require("./src/models");

sequelize.sync({ alter: true })
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log("Server running on port: " + `${process.env.PORT}`);
            });
        });
