module.exports = function(app,io, mongoose) {
    var fs = require('fs');
    var crypto = require('crypto');
    var cookie = require('cookie');
    var _USERCONNECTING = [];

    const ObjectId = mongoose.Types.ObjectId;
    const _PORT = 2345;

    const _FightingTypes = {
        member: 'Member',
        anonymous: 'Anonymous'
    }

    const _FightingStatus = {
        waiting: 0,
        fighting: 1,
        finished: 10
    }

    const _FightingWinTypes = {
        win: 'WIN',
        resigned: 'RESIGNED',
        timeout: 'TIMEOUT'
    }
    
    //Models
    const Fighting = require('../models/Fighting');
    const WaitingTable = require('../models/WaitingTable');
    const User = require('../models/User');
    
    var server = {
        access: 0,
        socket_access: {},
        table: [],
        database: {},
        table_waiting:{},
        room: {
        },
        init: function () {
            var _this = this;
            //Init mongodb
            _this.initSocket();
            _this.initRoomSocket();
            return;
        },
        initSocket: function () {
            var _this = this;
            _this.access = io
                .of('/access')
                .on('connection', function (socket) {
                    _this.socket_access = socket;
                    var userData = _this.getSharedCookie(socket.request._query['cookies']);
                    if(typeof(userData._id.$id) !='undefined'){
                        userData._id = userData._id.$id;
                    }
                    if(!_this.check_item(userData._id)){
                        var item = {};
                        item.socket = socket.id;
                        item.cookie = userData._id;
                        _USERCONNECTING.push(item);
                    }
                    //Get list figthings
                    _this.send_playing_fightings(socket, userData);
    
                    _this.socket_access.emit('received_user_connect', {user: _USERCONNECTING.length});
                    socket.on('message', function (msg) {
                        if (msg.type == 'invite_people') {
                            _this.invite_people(msg);
                        }
                        if (msg.type == 'chat_room') {
                            _this.chat_room(msg);
                        }
                        if (msg.type == 'join_fighting') {
                            _this.initTableSocket(msg, socket);
                        }
                        if (msg.type == 'confirm_fighting') {
                            _this.confirm_fighting(msg, socket);
                        }
                        if (msg.type == 'chat_table') {
                            _this.chat_table(msg, userData, socket);
                        }
                        if (msg.type == 'join_room') {
                            _this.join_room(msg);
                        }
                        if (msg.type == 'join_table') {
                            console.log(msg);
                            _this.join_table(msg, userData, socket, false);
                        }
                        if (msg.type == 'leave_room') {
                            _this.leave_room(msg);
                        }
                        if (msg.type == 'send_step_room') {
                            _this.send_step_room(msg);
    
                        }
                        if (msg.type == 'send_request_room') {
                            _this.send_request_room(msg);
    
                        }
                        if (msg.type == 'get_table_data') {
                            _this.get_table_data(msg, socket);
                        }
                        if (msg.type == 'regist_table_waiting') {
                            _this.regist_table_waiting(msg, userData, userData);
                        }
                        if (msg.type == 'get_tables') {
                            _this.get_table_waiting(msg, userData, null, socket);
                        }
                        if (msg.type == 'create_table') {
                            _this.create_anonymous_table(msg.data, userData, socket);
                        }
                        //Thuann add table move
                        if (msg.type == 'send_table_move') {
                            _this.table_move(msg, userData, socket);
                        }
    
                        if (msg.type == 'send_resigned') {
                            _this.table_resigned(msg, userData);
                        }
    
                        if (msg.type == 'check_game_over') {
                            _this.check_game_over(msg, userData);
                        }
                    });
    
                    //On disconnect
                    socket.on('disconnect', function () {
                        for (var i = _USERCONNECTING.length - 1; i >= 0; i--) {
                            console.log(_USERCONNECTING[i]);
                            if (_USERCONNECTING[i].socket == socket.id) {
                                _USERCONNECTING.splice(i, 1);
                                io.of('access').emit('received_user_connect', {user: _USERCONNECTING.length});
                           } 
                        } 
                    });
                })
        },
        initTableSocket: function (data, socket) {
            var _this = this;
            var roomId = 'table_' + data.table;
            socket.join(roomId);
        },
        initRoomSocket: function () {
            var _this = this;
            _this.room.onlineUsers = [];
            _this.room.socket = io.of('room').on('connection', function (socket) {
                var userData = _this.getSharedCookie(socket.request._query['cookies']);
                if (userData == false) {
                    return;
                }
                userData.socketId = socket.id;
                _this.join_room(userData);
    
                //Check if new online user
                var isExisted = false;
                for (i = _this.room.onlineUsers.length - 1; i >= 0; i--) {
                    if (_this.room.onlineUsers[i].username == userData.username) {
                        isExisted = true;
                    }
                }
                if (!isExisted) {
                    _this.room.onlineUsers.push(userData);
                    socket.emit('room_user_connect', {user: userData});
                    
                }
                socket.on('message', function (msg) {
                    if (msg.type == 'get_online_users') {
                        _this.get_room_users(msg, userData, socket);
                    }
                    if (msg.type == 'get_tables') {
                        _this.get_table_waiting(msg, userData, true, socket);
                    }
    
                    if (msg.type == 'create_table') {
                        _this.create_table(socket, msg.data, userData);
                    }
                    if (msg.type == 'join_table') {
                        _this.join_table(msg, userData, socket, true);
                        console.log('joined table' + msg);
                    }
                });
    
                //On disconnect
                socket.on('disconnect', function () {
                    
                    for (i = _this.room.onlineUsers.length - 1; i >= 0; i--) {
                        if (_this.room.onlineUsers[i].username == userData.username) {
                            _this.leave_room(userData);
                            _this.room.onlineUsers.splice(i, 1);
                            console.log('Room user ' + userData.username + ' disconected (' + _this.room.onlineUsers.length + ')', _this.room.room_id);
                            socket.emit('room_user_connect', {user: userData});
                        }
                    }
                });
            });
        },
        get_table_data: function(data, socket){
            var _this = this;
            Fighting.findById(data.table, function (err, fighting) {
                console.log(data.table);
                if(fighting){
                    var now = new Date();
                    if (fighting.status == 'fighting' && (fighting.host_timer <= now || fighting.slave_timer <= now)) {
                        fighting.status = 'finished';
                        fighting.win_type = 'TIMEOUT';
                        fighting.winner = fighting.next_turn == 'slave'?'host':'slave';
        
                        fighting.save(function(err){
                            console.log('Save fighting error => ' + err);
                        });
        
                        //Update member point
                        _this.update_member_point(fighting);
                    }
                    socket.emit('received_table_data', fighting);
                }
            });
        },
        check_item:function (cookie){
            for (var i = _USERCONNECTING.length - 1; i >= 0; i--) {
                if (_USERCONNECTING[i].cookie == cookie) {
                    return true;
                } 
            } 
            return false;
        },
        chat_table: function (data, user,socket) {
            var _this = this;
            Fighting
                .findOne(
                    {'_id': ObjectId(data.fighting)},
                    function (err, result) {
                        if (err) return;
                        //Check if anonymous figthing
                        if (result.host_player == user._id || result.slave_player == user._id) {
                            var message = {
                                'fighting_id': result._id,
                                'create_date': new Date(),
                                'update_date': new Date(),
                                'message': data.message,
                                'sender': user.id
                            }
                            _this.database.collection('fighting_chat').insertOne(message, function (err) {
                                if (err) return;
                                socket.broadcast.to('table_' + result._id).emit('received_table_chat',message);
                            })
                        }
                    }
                )
        },
        table_move: function (data, user, socket) {
            var _this = this;
            //Update database
            Fighting.findOne({'_id': ObjectId(data.table)}, function (err, fighting) {
                if (err) {
                    console.warn('Can not found fighting ' + data.table);
                    return;
                }
                
                if (fighting.status != _FightingStatus.fighting) {
                    return;
                }
    
                //Update fen
                fighting.fen = data.fen;
    
                //Game status
                // fighting.status = data.isGameOver ? 10 : 1;
                fighting.status = data.isGameOver ? _FightingStatus.finished : _FightingStatus.fighting;
                fighting.is_stalemate = data.isStalemate;
                fighting.is_checkmate = data.isCheckmate;
                fighting.is_in_draw = data.isInDraw;
                fighting.is_repetition = data.isRepetition;
                fighting.next_turn = data.move.color == fighting.host_color?'slave':'host';
    
                //Update winner
                if(data.isGameOver)
                {
                    if (data.isCheckmate || data.isStalemate) {
                        fighting.win_type = 'WIN';
                        if (data.move.color == fighting.host_color) {
                            fighting.winner = 'host';
                        } else {
                            fighting.winner = 'slave';
                        }
                    }
    
                    //Update member point
                    _this.update_member_point(fighting);
                }
    
                //Add to history
                var history = {
                    'fen': data.fen,
                    'move': data.move
                }
    
                if (Array.isArray(fighting.history)) {
                    fighting.history.push(history);
                } else {
                    fighting.history = [history];
                }
                
                //Update timer
            
                if (data.isHost) {
                    fighting.host_timer = new Date(fighting.host_timer.getTime() + (1000 * fighting.increment));
                } else {
                    fighting.slave_timer = new Date(fighting.slave_timer.getTime() + (1000 * fighting.increment));
                }
    
                fighting.save(function(err){
                    console.log('Save fighting error => ' + err);
                });
    
                //Send socket
                data.fighting = fighting;
                io.of('access').in('table_' + fighting._id).emit('received_table_move', data);
            });
        },
        table_resigned: function (data, user) {
            var _this = this;
            if(typeof(user._id.$id) !='undefined'){
                user._id = user._id.$id;
            }
            Fighting.findOne({'_id': ObjectId(data.table)}, function (err, fighting) {
                if (err) {
                    console.warn('Can not found fighting ' + data.table);
                    return;
                }
                //Check if fighting valid
                fighting.status = status_map[fighting.status] ? status_map[fighting.status] : fighting.status;
                if (fighting.status != 1) {
                    return;
                }
    
                // fighting.status = 10;
                fighting.status = 'finished';
                fighting.win_type ='RESIGNED';
    
                //Update winner
                fighting.winner = user._id == fighting.host_player ? 'slave' : 'host';
    
                //Save data
                fighting.save(function(err){
                    console.log('Save fighting error => ' + err);
                });
    
                //Update member point
                _this.update_member_point(fighting);
    
                //Send socket
                data.fighting = fighting;
                io.of('access').in('table_' + fighting._id).emit('received_table_resigned', data);
            });
        },
        join_table: function (data, user, socket, room) {
            var _this = this;
            if(typeof(user._id.$id) !='undefined'){
                user._id = user._id.$id;
            }
            if (typeof(data.table) != 'undefined') {
                // Update table in db
                Fighting.findOne({'_id': ObjectId(data.table)}, function (err, fighting) {
                    if (err) {
                        console.warn('Can not found fighting ' + data.table);
                        return;
                    }
                    fighting.status = status_map[fighting.status] ? status_map[fighting.status] : fighting.status;
                    if(fighting.status!=0){
                        return;
                    }
    
                    var startDate = new Date();
                    startDate = new Date(startDate.getTime() + (1000 * 60 * fighting.minute_per_side));
    
                    fighting.slave_player = user._id;
                    // fighting.status = 1;
                    fighting.status = 'fighting';
                    fighting.host_timer = startDate;
                    fighting.slave_timer = startDate;
    
                    fighting.save(function(err){
                        if (err) {
                            console.log({'error': 'An error has occurred', data: err});
                            return;
                        }
                        
                        if(room){
                            console.log('joined table ' + data.table);
                            _this.room.socket.emit('received_join_table', fighting);
        
                            console.log('joined table ' + data.table);
                            io.of('access').in('table_' + fighting._id).emit('received_slave_join_table', fighting);   
                        }else{
                            console.log('joined table ' + data.table);
                            io.of('access').emit('received_join_table', fighting);
        
                            console.log('joined table ' + data.table);
                            io.of('access').in('table_' + fighting._id).emit('received_slave_join_table', fighting);    
                        }
                       
                        //Send to current socket
                        socket.emit('received_joined_table_success', fighting);
                    });
                });
    
            }
        },
        update_member_point: function(fighting){
            var _this = this;
            var winner = null;
            var winPoint = 10;
    
            if(fighting.winner=='host'){
                User.findOne({'_id': ObjectId(fighting.host_player)}, function (err, user) {
                    if(user){
                        user.point = (user.point)?user.point+winPoint:winPoint;
                        _this.database.collection('member').save(user);
                    }
                });
            }else{
                User.findOne({'_id': ObjectId(fighting.slave_player)}, function (err, user) {
                    if(user){
                        user.point = (user.point)?user.point+winPoint:winPoint;
                        _this.database.collection('member').save(user);
                    }
                });
            }
        },
        check_game_over: function(data){
            var _this = this;
            Fighting.findOne({'_id': ObjectId(data.table)}, function (err, fighting) {
                var now = new Date();
                if (fighting.status == 'fighting' && (fighting.host_timer <= now || fighting.slave_timer <= now)) {
                    fighting.status = 'finished';
                    fighting.win_type = 'TIMEOUT';
                    fighting.winner = fighting.next_turn == 'slave'?'host':'slave';
    
                    fighting.save(function(err){
                        console.log('Save fighting error => ' + err);
                    });
    
                    //Update member point
                    _this.update_member_point(fighting);
    
                    io.of('access').in('table_' + data.table).emit('received_game_over', {fighting: fighting});
                }
            });
        },
        confirm_fighting:function(data, socket){
            io.of('access').in('table_' + data.table).emit('received_slave_join_table', data);
        },
        join_room: function (data) {
            var _this = this;
            _this.room.socket.emit('received_join_room', {user: data});
        },
        leave_room: function (data) {
            var _this = this;
            _this.room.socket.emit('received_leave_room', {user: data});
        },
        send_step_room: function (data) {
            var _this = this;
            // console.log(data);
            _this.socket_access.broadcast.emit('received_send_step_room', data.move);
            _this.socket_access.emit('received_send_step_room', data.move);
        },
        send_request_room: function (data) {
            var _this = this;
        },
        regist_table_waiting: function (data) {
            var _this = this;
            WaitingTable.find({
                'table': data.table,
                $or: {'member._id': data.member_id}
            }).limit(1).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    _this.send_info_member(data.member, result);
                } else {
                    //regist db  table waitingx
                }
            });
        },
        send_info_member: function (member_me, member_other) {
    
        },
        get_table_waiting: function (data, user, room, socket) {
            var _this = this;
            if(typeof(user._id.$id) !='undefined'){
                user._id = user._id.$id;
            }
            var condition = {
                'status': 'waiting',
                'host_player': {'$ne': user._id}
            };
            
            if (room) {
                //condition.room_id = room.room_id;
                condition.type = _FightingTypes.Member
            }
    
            var result= WaitingTable
                .find(condition)
                .sort({'create_date': 1})
                .limit(room ? 50 : 15)
                .exec(function (err, result) {
                    if (err) throw err;
    
                    if (result.length > 0) {
                        data = {
                            'tables': result
                        }
                        socket.emit('received_get_tables', data);
                    }
                });
        },
        send_playing_fightings:function (socket, user) {
            var _this= this;
            var condition = {
                'status': 'fighting',
                '$or':
                [
                    {'host_player': user._id},
                    {'slave_player': user._id}
                ],
                'host_timer': {'$gte':new Date()},
            };
    
            var result= Fighting
                .find(condition)
                .sort({'create_date': 1})
                .exec(function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        data = {
                            'tables': result
                        }
                        socket.emit('received_fighting_list', data);
                    }
                });
        },
        create_anonymous_table: function (data, user, socket) {
            var _this = this;
            if(typeof(user._id.$id) !='undefined'){
                user._id = user._id.$id;
            }

            var obj_host = {}
            if(typeof(user.fullname) != 'undefined'){
                obj_host.fullname = user.fullname;
            }else{
                obj_host.fullname = _FightingTypes.Anonymous;
            }
            if(typeof(user.point) != 'undefined'){
                obj_host.point = user.point;
            }else{
                obj_host.point = 0 ;
            }
            if(typeof(user.level) != 'undefined'){
                obj_host.level = user.level;
            }else{
                obj_host.level = 1;
            }
            if(typeof(user.avatar) != 'undefined'){
                obj_host.avatar = user.avatar;
            }else{
                obj_host.avatar = '';
            }

            insertData= new WaitingTable();
            insertData.name = "Unamed";
            insertData.host_player = user._id;
            insertData.slave_player = null;
            insertData.info_host = obj_host;
            insertData.host_color = data.color ? (data.color == 'random' ? _this.get_random_color() : data.color) : 'w';
            insertData.room_id = null;
            insertData.update_date = new Date();
            insertData.create_date = new Date();
            insertData.history = [];
            insertData.minute_per_side = data.minutePerSide ? data.minutePerSide : 10;
            insertData.increment_second = data.incrementInSeconds ? data.incrementInSeconds : 8;
            insertData.winner = null;
            insertData.status = _FightingStatus.waiting;
            insertData.type = _FightingTypes.Anonymous;
            insertData.save((err, result) => {
                if (err) throw err;
                //Emit new room success
                socket.emit('received_create_table_success', result);

                //Emit new room success
                io.of('access').emit('received_new_table', result);
            })
        },
        create_table: function (socket, data, user) {
            var _this = this;
            var insertData = {
                'name': 'Unnamed',
                'host_player': user._id,
                'slave_player': null,
                'info_host' : user,
                'level': data.level,
                'room_id': 'room_' + data.level,
                'update_date': new Date(),
                'create_date': new Date(),
                'host_color': data.color ? (data.color == 'random' ? _this.get_random_color() : data.color) : 'w',
                'minute_per_side': data.minutePerSide ? data.minutePerSide : 10,
                'increment': data.incrementInSeconds ? data.incrementInSeconds : 8,
                'winner': -1, //-1: playing, 0: host player, 1: slave player
                'status': 'waiting', //0:WAITING, 1: PLAYING, 10: COMPLETED
                'type': _FightingTypes.Member
            }
            WaitingTable.insertOne(insertData, function (err,doc_insert) {
                if (err) throw err;
    
                console.log('Create success');
                //Emit new room success
               // room.socket.sockets[user.socketId].emit('received_create_table_success', insertData);
    
                //Emit new room success
                //room.socket.emit('received_new_table', insertData);
    
                //Emit new room success
                socket.emit('received_create_table_success', insertData);
    
                //Emit new room success
                socket.broadcast.emit('received_new_table', insertData);
            });
        },
        getSharedCookie: function (cookies) {
            try {
                cookies = cookie.parse(cookies);
                if (cookies.shared_session) {
                    var key = 'MySecretKey12345';
                    var iv = '1234567890123456';
                    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    
                    var decrypted = decipher.update(cookies.shared_session, 'hex', 'binary');
                    decrypted += decipher.final('binary');
                    return JSON.parse(decrypted);
                } else {
                    return {_id: cookies.session_id}
                }
            } catch (ex) {
                return false;
            }
        },
        get_online_users: function (data, user, room) {
            var result = [];
            for (var i = 0; i < room.onlineUsers.length; i++) {
                result.push({
                    username: room.onlineUsers[i].username,
                    fullname: room.onlineUsers[i].fullname,
                    avatar: room.onlineUsers[i].avatar
                })
            }
            this.socket_access.emit('received_room_online_users', {users: result});
        },
        get_room_users: function (data, user,socket) {
            var _this= this;
            var result = [];
            for (var i = 0; i < _this.room.onlineUsers.length; i++) {
                result.push({
                    username: _this.room.onlineUsers[i].username,
                    fullname: _this.room.onlineUsers[i].fullname,
                    avatar: _this.room.onlineUsers[i].avatar,
                    level: _this.room.onlineUsers[i].level
                })
            }
            socket.emit('received_room_online_users', {users: result});
        },
        get_random_color: function () {
            var colors = ['b', 'w'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    };

    console.log('init socket');
    server.init();
}
