	// Patch #1: _doIdentify
	this.seq=0,
	this.sessionId=null;
	let e=this.handleIdentify();
	if(null===e){
		this._handleClose(!0,4004,"No connection info provided");
		return
	}
	this.connectionState=C.default.IDENTIFYING;
	let t=Date.now();
	this.identifyStartTime=t;
	let n=await _.default.getClientState();
	if(this.connectionState!==C.default.IDENTIFYING||this.identifyStartTime!==t){
		U.warn("Skipping identify because connectionState or identifyStartTime has changed");
		return
	}
	let{token:i,properties:s={},presence:r}=e;
	this.token=i,U.verbose("[IDENTIFY]");
	function showToast(
            message,
            type,
            {
                position,
                timeout,
            } = {}
        ) {
            Vencord.Webpack.Common.Toasts.show({
                message,
                id: (Math.random() || Math.random()).toString(36).slice(2),
                type,
                options: {
                    timeout,
                    position,
                },
            });
        }
	// Electron get botInfo
	const botInfo = await electron.getBotInfo(i);
	console.log(botInfo)
	if (!botInfo.success) {
		showToast(botInfo.message, 2);
		return this._handleClose(!0, 4004, botInfo.message);
	}
	const intentsData = await electron.requestIntents(botInfo.data.flags);
	const intents = getIntents(...intentsData.skip);
	allShards = Math.ceil(parseInt(botInfo.data.approximate_guild_count) / 200) || 1;
	showToast('Bot Intents: ' + intents, 1);
	showToast(`Shard ID: ${0} (All: ${allShards})`, 1);
	let o={
		token:i,
		properties:{
			browser: 'Chrome',
            device: 'BotClient',
            os: 'Windows',
        },
		intents,
		presence:r,
		compress:this.compressionHandler.usesLegacyCompression(),
		client_state:(0,P.toGatewayClientState)(n),
		shard: [0, allShards],
	},l=JSON.stringify(o);
	this.identifyUncompressedByteSize=l.length,
	this.identifyCompressedByteSize=a.deflate(l).length,
	this.lastIdentifyClientState=o.client_state,
	this.identifyCount+=1,
	this.send(D.Opcode.IDENTIFY,o,!1)
	}_doFastConnectIdentify(){this.seq=0,this.sessionId=null;let e=this.handleIdentify();if(null===e){this._handleClose(!0,4004,"No connection info provided");return}let{token:t}=e;this.token=t,this.connectionState=C.default.IDENTIFYING,this.identifyStartTime=Date.now(),this.identifyCount+=1,U.verbose("[IDENTIFY, fast-connect]"),this._updateLastHeartbeatAckTime()}_doResumeOrIdentify(){let e=Date.now(),t=null!==this.sessionId&&(null==this.lastHeartbeatAckTime||e-this.lastHeartbeatAckTime<=G);t?this._doResume():this._doIdentify(),this._updateLastHeartbeatAckTime()}_updateLastHeartbeatAckTime(){this.lastHeartbeatAckTime=Date.now()}_sendHeartbeat(){this.send(D.Opcode.HEARTBEAT,this.seq,!1)}getLogger(){return U}willReconnect(){return this.connectionState===C.default.WILL_RECONNECT}isClosed(){return this.connectionState===C.default.CLOSED}isSessionEstablished(){return this.connectionState===C.default.SESSION_ESTABLISHED||this.connectionState===C.default.RESUMING}isConnected(){return this.connectionState===C.default.IDENTIFYING||this.connectionState===C.default.RESUMING||this.connectionState===C.default.SESSION_ESTABLISHED}connect(){return this.isClosed()?(U.verbose(".connect() called, new state is WILL_RECONNECT"),this.connectionState=C.default.WILL_RECONNECT,this._connect(),!0):(U.error("Cannot start a new connection, connection state is not closed"),!1)}getIdentifyInitialGuildId(){var e;return null===(e=this.lastIdentifyClientState)||void 0===e?void 0:e.initial_guild_id}resetSocketOnError(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{sentry:!0,immediate:!1};U.error("resetSocketOnError",e.stack);let i=null!=e.message&&e.message.indexOf("Guild data was missing from store")>=0;g.default.increment({name:u.MetricEvents.SOCKET_CRASHED,tags:["action:".concat(t)]},!0),n.sentry=n.sentry&&!i,n.immediate=n.immediate||i,n.sentry&&I.default.captureException(e,{tags:{socketCrashedAction:t}}),this._cleanup(e=>e.close()),this._reset(!0,1e3,"Resetting socket due to error."),this.dispatcher.clear(),this.connectionState=C.default.WILL_RECONNECT,this.dispatchExceptionBackoff.cancel(),0===this.dispatchExceptionBackoff._fails&&n.immediate?(U.verbose("Triggering fast reconnect"),this.dispatchExceptionBackoff.fail(()=>{}),setTimeout(()=>this._connect(),0)):this.dispatchExceptionBackoff.fail(()=>this._connect()),this.didForceClearGuildHashes=!0,f.default.dispatch({type:"CLEAR_GUILD_CACHE"}),clearTimeout(this.dispatchSuccessTimer),this.dispatchSuccessTimer=setTimeout(()=>this.dispatchExceptionBackoff.succeed(),2*F)}close(){if(this.isClosed()){U.verbose("close() called, but socket is already closed.");return}U.info("Closing connection, current state is ".concat(this.connectionState)),this._cleanup(e=>e.close()),this.connectionState=C.default.CLOSED,setImmediate(()=>{this._reset(!0,1e3,"Disconnect requested by user")})}networkStateChange(e,t){let n=!(arguments.length>2)||void 0===arguments[2]||arguments[2];this.expeditedHeartbeat(e,t,n,!1)}expeditedHeartbeat(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=!(arguments.length>2)||void 0===arguments[2]||arguments[2],i=!(arguments.length>3)||void 0===arguments[3]||arguments[3];if(!this.isClosed()){if(this.isConnected()){U.verbose("Performing an expedited heartbeat ".concat(null!=t&&""!==t?"reason: "+t:"")),this.heartbeatAck=!1,this._sendHeartbeat(),null!==this.expeditedHeartbeatTimeout&&clearTimeout(this.expeditedHeartbeatTimeout),this.expeditedHeartbeatTimeout=setTimeout(()=>{this.expeditedHeartbeatTimeout=null,!1===this.heartbeatAck&&this._handleHeartbeatTimeout()},e);return}n?this.resetBackoff(t,i):U.verbose("Expedited heartbeat requested, but, connection state is ".concat(this.connectionState," and reconnectImmediately was not requested ").concat(null!=t&&""!==t?"reason: "+t:""))}}resetBackoff(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=!(arguments.length>1)||void 0===arguments[1]||arguments[1];U.verbose("Connection has reset backoff".concat(null!=e&&""!==e?" for reason: "+e:"")),this.gatewayBackoff.succeed(),this.iosGoingAwayEventCount=0,this.nextReconnectIsImmediate=!0,this.willReconnect()?this._connect():t&&this.connectionState!==C.default.SESSION_ESTABLISHED&&this._handleClose(!0,0,e)}constructor(){super(),this.dispatchExceptionBackoff=new o.default(1e3,F),this.dispatchSuccessTimer=0,this.didForceClearGuildHashes=!1,this.identifyUncompressedByteSize=0,this.identifyCompressedByteSize=0,this.analytics={},this.identifyCount=0,this.resumeUrl=null,this.lastIdentifyClientState=null,this.iosGoingAwayEventCount=0,this.send=(e,t,n)=>{E.default.isLoggingGatewayEvents&&U.verboseDangerously("~>",e,t);let i=w.pack({op:e,d:t});if(!n||this.isSessionEstablished())try{null!=this.webSocket?this.webSocket.send(i):U.warn("Attempted to send without a websocket that exists. Opcode: ".concat(e))}catch(e){}else U.warn("Attempted to send while not being in a connected state opcode: ".concat(e))},this.dispatcher=new O.default(this),this.gatewayBackoff=new o.default(1e3,6e4),this.connectionState_=C.default.CLOSED,this.webSocket=null,this.seq=0,this.sessionId=null,this.token=null,this.initialHeartbeatTimeout=null,this.expeditedHeartbeatTimeout=null,this.lastHeartbeatAckTime=null,this.helloTimeout=null,this.heartbeatInterval=null,this.heartbeater=null,this.heartbeatAck=!0,this.connectionStartTime=0,this.identifyStartTime=0,this.nextReconnectIsImmediate=!1,this.compressionHandler=new y.default(w),this.hasConnectedOnce=!1,this.isFastConnect=!1,this.identifyCount=0,this.iosGoingAwayEventCount=0}}},342797:function(e,t,n){"use strict";n.r(t),n.d(t,{logReadyPayloadReceived:function(){return l},getConnectionPath:function(){return u},getReadyPayloadByteSizeAnalytics:function(){return d},createResumeAnalytics:function(){return c},logResumeAnalytics:function(){return f}}),n("424973");var i=n("102053");n("704744");var s=n("410912"),r=n("697218"),a=n("599110"),o=n("49111");function l(e,t,n,r,l){var u,d,c;let f=function(e){let{_trace:t}=e,n={};try{let e=JSON.parse(t);null!=e[0]&&""!==e[0]&&e[0].startsWith("gateway-")&&(n.identify_total_server_duration_ms=Math.floor(e[1].micros/1e3)),function e(t,n){if(null!=t&&t.length>0)for(let i=0;i<t.length;i+=2){let s=t[i],r=t[i+1];n(s,r.micros),e(r.calls,n)}}(e,(e,t)=>{"start_session"===e?n.identify_api_duration_ms=Math.floor(t/1e3):"guilds_connect"===e&&(n.identify_guilds_duration_ms=Math.floor(t/1e3))})}catch(e){}return n}(t);null!=r&&i.default.addDetail("payload_size(kb)",Math.round(r.uncompressed_byte_size/1024)),i.default.addDetail("server_time(ms)",null!==(u=f.identify_total_server_duration_ms)&&void 0!==u?u:0);let _={...r,...f,...function(e){let{guilds:t}=e,n=0,i=0;return t.forEach(e=>{if(e.unavailable)return;let t="partial"===e.data_mode?e.partial_updates.channels:e.channels;null!=t&&null!=t.forEach&&t.forEach(e=>{i++,e.type===o.ChannelTypes.GUILD_CATEGORY&&n++})}),{num_guilds:t.length,num_guild_channels:i,num_guild_category_channels:n}}(t),...l,duration_ms_since_identify_start:n-e.identifyStartTime,duration_ms_since_connection_start:n-e.connectionStartTime,duration_ms_since_emit_start:Date.now()-n,is_reconnect:e.hasConnectedOnce,is_fast_connect:e.isFastConnect,did_force_clear_guild_hashes:e.didForceClearGuildHashes,identify_uncompressed_byte_size:e.identifyUncompressedByteSize,identify_compressed_byte_size:e.identifyCompressedByteSize,had_cache_at_startup:null!==(d=e.analytics.hadCacheAtStartup)&&void 0!==d&&d,used_cache_at_startup:null!==(c=e.analytics.usedCacheAtStartup)&&void 0!==c&&c};s.default.attachReadyPayloadProperties(_),a.default.track(o.AnalyticEvents.READY_PAYLOAD_RECEIVED,_,{logEventProperties:!0})}function u(e){try{var t;let n=function(e){if(null==e)return null;let t=JSON.parse(e);return function e(t,n){if(null==t)return"";let i="";for(let s=0;s<t.length;s+=2)i+="\n".concat(n).concat(t[s],": ").concat(t[s+1].micros/1e3)+e(t[s+1].calls,n+"|  ");return i}(t,"")}(null===(t=e._trace)||void 0===t?void 0:t[0]);if(null!=n)return n}catch(e){}return null!=e._trace?e._trace.join(" -> "):"???"}
function d(e) {
    var t, n;
    let i = Date.now(),
        {
            guilds: s,
            merged_presences: r,
            merged_members: a,
            read_state: o,
            private_channels: l,
            user_guild_settings: u,
            user_settings: d,
            user_settings_proto: c,
            experiments: f,
            guild_experiments: _,
            relationships: h,
            users: g,
            ...m
        } = e,
        E = [],
        p = [],
        v = [],
        S = [],
        T = [],
        I = [],
        C = [],
        A = [];
    return s.forEach(e => {
        var t;
        if (e.unavailable) return;
        let {
            features: n,
            ...i
        } = null !== (t = e.properties) && void 0 !== t ? t : {}, {
            threads: s,
            guild_scheduled_events: r,
            ...a
        } = e;
        E.push("partial" === e.data_mode ? e.partial_updates.channels : e.channels), p.push("partial" === e.data_mode ? e.partial_updates.roles : e.roles), v.push("partial" === e.data_mode ? e.partial_updates.emojis : e.emojis), S.push(s), T.push("partial" === e.data_mode ? e.partial_updates.stickers : e.stickers), I.push(n), C.push(r), A.push(a, i)
    }), {
        presences_size: JSON.stringify(null !== (t = null == r ? void 0 : r.friends) && void 0 !== t ? t : []).length,
        users_size: JSON.stringify(g).length,
        read_states_size: JSON.stringify(o).length,
        private_channels_size: JSON.stringify(l).length,
        user_settings_size: JSON.stringify(null != d ? d : "").length + (null != c ? c : "").length,
        experiments_size: JSON.stringify(null != f ? f : []).length + JSON.stringify(null != _ ? _ : []).length,
        user_guild_settings_size: JSON.stringify(u).length,
        relationships_size: JSON.stringify(h).length,
        remaining_data_size: JSON.stringify(null != m ? m : {}).length,
        guild_channels_size: JSON.stringify(E).length,
        guild_members_size: JSON.stringify(null != a ? a : []).length,
        guild_presences_size: JSON.stringify(null !== (n = null == r ? void 0 : r.guilds) && void 0 !== n ? n : []).length,
        guild_roles_size: JSON.stringify(p).length,
        guild_emojis_size: JSON.stringify(v).length,
        guild_threads_size: JSON.stringify(S).length,
        guild_stickers_size: JSON.stringify(T).length,
        guild_events_size: JSON.stringify(C).length,
        guild_features_size: JSON.stringify(I).length,
        guild_remaining_data_size: JSON.stringify(A).length,
        size_metrics_duration_ms: Date.now() - i
    }
}
//# sourceMappingURL=70523.8c4a899e1fc2e9b9a86c.js.map