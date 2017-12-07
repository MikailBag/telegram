import _log from "log"
const log = _log("telegram")
const axios = require("axios").create({
    timeout: 25000
})
const qs = require("querystring")


async function query(token: string, method: string, params: {[key: string]: string}=null, verb='GET') {
    const url = `https://api.telegram.org/bot${token}/${method}`
    let prom = axios.get(url, {
        params: params
    })
    log(`quering TG ${url} with params %o`,params)
    let res
    try {
        res = await prom
    } catch (err) {
        console.error(err)
        return {}
    }
    return res.data.result
}

export interface TGMessage {
    message_id: number
    chat: TGChat
    text: string
}

export interface TGUpdate {
    update_id: number
    message?: TGMessage
}

export interface TGChat {
    id: number
    type: "private" | "group" | "supergroup" | "channel"
    username?: string
}

export class Telegram {
    token: string
    offset: number
    constructor(token: string) {
        this.token = token
        this.offset = 0
    }
    async getUpdates(){
        let res = await query(this.token, 'getUpdates', {
            offset: this.offset.toString()
        })
        for (let upd of res) {
            this.offset = Math.max(this.offset, upd.update_id + 1)
        }
        return res
    }
    async sendMessage(chat_id: number | string, messageText: string) {
        let res = await query(this.token, 'sendMessage', {
            chat_id: chat_id.toString(),
            text: messageText
        })
        return res
    }
    async setWebHook(url: string) {
        let res = await query(this.token, 'setWebHook', {
            url
        })
        return res
    }
    async deleteWebHook() {
        return await query(this.token, 'deleteWebHook')
    }
}

