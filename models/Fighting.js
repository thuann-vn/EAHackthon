const mongoose = require('mongoose');

const fightingSchema = new mongoose.Schema({
  _id: mongoose.Schema.ObjectId,
  host_player: String,
  slave_player: String,
  host_color: String,
  room_id: String,
  name: String,
  type: String,
  minute_per_side: Number,
  increment_second: Number,
  status: String,
  table_waiting_id: String,
  room_id: String,

  host_timer: Date,
  slave_timer: Date,
  join_date: Date,
  last_play: Date,
  create_date: Date,
  update_date: Date,
  
  fen: String,
  is_stalemate: Boolean,
  is_checkmate: Boolean,
  is_in_draw: Boolean,
  is_repetition: Boolean,
  win_type: String,
  winner: String,

  history: Array,
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

const Fighting = mongoose.model('Fighting', fightingSchema);

module.exports = Fighting;
