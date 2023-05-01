import express, { json, urlencoded } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { UserDB } from "./models/User.js";
import { connectDatabase } from "./configs/db.js";

config();

const app = express();

app.use(cookieParser());
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

app.get('/claim', async (req, res) => {
  let addr = req.body.address;
  let user = await UserDB.findOne({ address: addr });
  if (!user) {
    user = await UserDB.create({
      address: addr,
      xp: 0,
      timestamps: [],
    })
  }

  let now = new Date();
  while (user.timestamps.length) {
    if (user.timestamps[0] < now - WEEK) {
      user.timestamps.splice(0, 1);
    } else break;
  }
  if (user.timestamps.length && user.timestamps[user.timestamps.length - 1].getDate() == now.getDate()) {
    res.send("already claimed");
    return;
  }
  user.timestamps.push(now);
  user.xp += 100;
  await user.save();
  res.send(user);
});

app.get('/claim_data', async (req, res) => {
  let addr = req.body.address;
  let user = await UserDB.findOne({address: addr});
  if (!user) {
    res.send({
      status: [],
      xp: 0,
    });
    return;
  }

  let cur = new Date();
  let status = [];

  let timestamps = user.timestamps.reverse();
  for (let i = 0; i < 7; i++, cur = new Date(cur - DAY)) {
    if (cur.getDate() == timestamps[0].getDate()) {
      status.push(true);
      timestamps.splice(0, 1);
    } else status.push(false);
  }
  let data = {
    status: status.reverse(),
    xp: user.xp,
  };
  res.send(data);
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
