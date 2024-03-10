import app from "./src/app";
import mongoose from "mongoose";

mongoose
  .connect(
    process.env.MONGODB_URL as string
  )
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    // Handle the error appropriately
  });
