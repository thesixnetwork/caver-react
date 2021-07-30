import QRcode from 'qrcode'
import axios from 'axios'
import {
    isMobile
} from "react-device-detect";
// const Caver = require('caver-js')

export default class KlipProvider {
    constructor() {
        this.isAuth = false
        this.requestKey = ''
        this.responseData = undefined

    }
    private isAuth: boolean
    private requestKey: string
    private responseData: any
    private intervalCheckResult?: NodeJS.Timeout
    private account: string = ""

    initData = () => {
        this.requestKey = ""
        this.responseData = undefined
    }

    login = () => {
        this.isAuth = true
    }
    logout = () => {
        this.isAuth = false
    }
    getAuth = () => {
        return this.isAuth
    }
    genQRcode = (showModal: () => void) => {
        this.initData()
        const mockData = {
            bapp: {
                name: 'definix',
            },
            type: 'auth',
        }
        axios.post('https://a2a-api.klipwallet.com/v2/a2a/prepare', mockData).then(async (response) => {
            this.requestKey = response.data.request_key
            if (isMobile) {
                this.intervalCheckResult = setInterval(this.getResult, 1000)
                this.openDeeplink(`https://klipwallet.com/?target=/a2a?request_key=${response.data.request_key}`)
            } else {
                await showModal()
                await QRcode.toCanvas(
                    document.getElementById('qrcode'),
                    `https://klipwallet.com/?target=/a2a?request_key=${response.data.request_key}`,
                    () => {
                        this.intervalCheckResult = setInterval(this.getResult, 1000)
                    }
                )
            }
        })
    }

    getResult = async () => {

        const url = `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${this.requestKey}`

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


    openDeeplink = (url: string) => {
        const checkRedirect = window.open(url, "_blank")
        if (checkRedirect === null) {
            window.location.href = `kakaotalk://klipwallet/open?url=${url}`
            setTimeout(function () {
                if (document.hasFocus()) {
                    window.location.replace("https://apps.apple.com/kr/app/%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%86%A1-kakaotalk/id362057947")
                }
            }, 4500);
        }

    }
    Popup() {
        var myDialog = document.createElement("dialog");
        document.body.appendChild(myDialog)
        var text = document.createTextNode("This is a dialog window");
        myDialog.appendChild(text);
        myDialog.showModal();
    }

}