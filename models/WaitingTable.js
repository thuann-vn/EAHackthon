const mongoose = require('mongoose');

const waitingTableSchema = new mongoose.Schema({
  host_player: String,
  slave_player: String,
  host_color: String,
  room_id: String,
  name: String,
  type: String,
  minute_per_side: Number,
  increment_second: Number,
  status: String,
  room_id: String,

  host_timer: Date,
  slave_timer: Date,
  join_date: Date,
  last_play: Date,
  create_date: Date,
  update_date: Date,

  info_host: {
    fullname: String,
    point: Number,
    level: Number,
    avatar: String
  },
  
  info_slave: {
    fullname: String,
    point: Number,
    level: Number,
    avatar: String
  }
}, { timestamps: true });

const WaitingTable = mongoose.model('table_waiting', waitingTableSchema);

module.exports = WaitingTable;
