// import * as React from 'react'
import * as ReactDOM from 'react-dom'
import QRcode from 'qrcode'
import axios from 'axios'


let request_key=""
let responseData:any=undefined
let intervalCheckResult:NodeJS.Timeout

const initData = ()=>{
  request_key=""
  responseData=undefined
}

export const genQRcode = () => {
  initData()
  const mockData = {
    bapp: {
      name: 'definix',
    },
    type: 'auth',
  }
  // ReactDOM.createPortal(<div>g</div>,document.getEle)
  axios.post('https://a2a-api.klipwallet.com/v2/a2a/prepare', mockData).then((response) => {
    request_key = response.data.request_key
    QRcode.toCanvas(
      document.getElementById('qrcode'),
      `https://klipwallet.com/?target=/a2a?request_key=${response.data.request_key}`,
      () => {
        intervalCheckResult = setInterval(getResult, 1000)
      }
    )
  })
}
const getResult = async () => {
  // const url =`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
  const url =`http://localhost:8080`
  const res = await axios.get(url)
  console.log("request status : ",res.data.status)
  if (res.data.status != "prepared") {
    responseData = res.data.result.klaytn_address
    const x= document.querySelector('#modal')
    clearInterval(intervalCheckResult)
  }

}


export const getRequestKey = () => request_key

export const checkResponse = async():Promise<string> => {
  return new Promise(resolve => {
    let interCheck:NodeJS.Timeout
    const isReslove= ()=>{
      console.log("check interval")
      if(responseData != undefined){
        clearInterval(interCheck)
        resolve(responseData);
      }
    }
    interCheck = setInterval(isReslove,1000)
  });
}

// export const getResult = () => {
//   axios
//     .get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${requestKey}`)
//     .then((res) => {
//       alert(`json result : ${res.data.result.klaytn_address}`)
//     })
//     .catch(function (error) {
//       // handle error
//       console.log('err ', error)
//     })
// }
// interface Props {

// }

// export const ExampleComponent = ({ }: Props) => {
//   return <div >Example Component</div>
// }

// const rootElement = document.getElementById("root");

// ReactDOM.render((<ExampleComponent />), rootElement);
