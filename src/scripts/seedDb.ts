import { CreationAttributes } from "sequelize";
import sequelize from "@/config/db";
import { UserRole } from "@/models/Role";
import { Role } from "@/models/Role";

const seedDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database successfully.");

    await sequelize.sync({ force: false });
    console.log("Models synchronized with the database.");

    for (const roleName of Object.values(UserRole)) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName } as CreationAttributes<Role>,
      });
    }
    console.log("Roles verified/created.");
  } catch (error) {
    console.error("Error connecting or synchronizing the database:", error);
    process.exit(1);
  }
};

seedDb();
