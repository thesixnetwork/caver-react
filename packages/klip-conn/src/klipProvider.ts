import QRcode from 'qrcode'
import axios from 'axios'
// const Caver = require('caver-js')
import {Send} from './types'


export default class KlipProvider {
    constructor() {
        this.isAuth = false
        this.requestKey = ''
        this.responseData = undefined
        // this.caver = new Caver("https://kaikas.cypress.klaytn.net:8651/")
        // this.send = (new Caver("https://kaikas.cypress.klaytn.net:8651/")).klaytn
    }
    private isAuth: boolean
    private requestKey: string
    private responseData: any
    private intervalCheckResult?: NodeJS.Timeout
    private account: string = ""
    // private caver 
    // public send 
    initData = () => {
        this.requestKey = ""
        this.responseData = undefined
    }

    login = () => {
        this.isAuth = true
    }
    logout = () => {
        // console.log(this.send)
        this.isAuth = false
    }
    getAuth = () => {
        return this.isAuth
    }
    genQRcode = () => {
        this.initData()
        const mockData = {
            bapp: {
                name: 'definix',
            },
            type: 'auth',
        }
        axios.post('https://a2a-api.klipwallet.com/v2/a2a/prepare', mockData).then((response) => {
            this.requestKey = response.data.request_key
            QRcode.toCanvas(
                document.getElementById('qrcode'),
                `https://klipwallet.com/?target=/a2a?request_key=${response.data.request_key}`,
                () => {
                    this.intervalCheckResult = setInterval(this.getResult, 1000)
                }
            )
        })
    }

    getResult = async () => {
        const url = `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${this.requestKey}`
        // const url = `http://localhost:8080?request_key=${this.requestKey}`
        const res = await axios.get(url)
        if (res.data.status == "completed") {
            this.account = res.data.result.klaytn_address
            this.responseData = res.data.result.klaytn_address

            if (this.intervalCheckResult)
                clearInterval(this.intervalCheckResult)
        }

    }

    getAccount = () => this.account
    getRequestKey = () => this.requestKey

    checkResponse = async (): Promise<string> => {
        return new Promise(resolve => {
            const interCheck = setInterval(() => {

                if (this.responseData != undefined) {
                    clearInterval(interCheck)
                    resolve(this.responseData);
                }
            }, 1000)

        });
    }

    genQRcodeContactInteract = (contractAddress: string, abi: string, input: string) => {
        this.initData()
        const mockData = {
            "bapp": {
                "name": "definix"
            },
            "type": "execute_contract",
            "transaction": {
                "to": contractAddress,
                "value": "0",
                "abi": abi,
                "params": input
            }
        }
        axios.post('https://a2a-api.klipwallet.com/v2/a2a/prepare', mockData).then((response) => {
            this.requestKey = response.data.request_key
            QRcode.toCanvas(
                document.getElementById('qrcode'),
                `https://klipwallet.com/?target=/a2a?request_key=${response.data.request_key}`,
                () => {
                    this.intervalCheckResult = setInterval(this.getResult, 1000)
                }
            )
        })
    }
    
    
    
}