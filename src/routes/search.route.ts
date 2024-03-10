import express from "express";
const app = express.Router();
import { authenticate, verifyAuthToken } from "../middlewares/auth";
import data from "../utils/data";

app.get("/", [authenticate,verifyAuthToken], (req, res) => {
  const {
    state,
    lgas,
    region,
  } = req.query;

  let results;
  if (state) {
    const _data = data.filter(
      (data) => data.state?.toLowerCase() === (state as string).toLowerCase()
    );
    results = _data;
  } else if (lgas) {
    const _data = data.filter((data) =>
      data.lgas
        ?.map((data_) => data_.toLowerCase())
        ?.includes((lgas as string).toLowerCase())
    );
    results = _data;
  } else if (region) {
    const _data = data.filter(
      (data) => data.region?.toLowerCase() === (region as string).toLowerCase()
    );
    results = _data;
  } else {
    return res.status(200).json({ message: "Successfully fetched data", data });
  }

  res.status(200).json({ message: "Successfully fetched data", data: results });
});

export default app;
