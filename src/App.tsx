import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import "./styles.css";
import ConnectButton from "./components/ConnectButton";
import {
  FollowButton,
  Env,
  Blockchain,
} from "@cyberconnect/react-follow-button";
import { Form, Input, Button, Space, List, Skeleton, Divider,Row, Col } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import InfiniteScroll from 'react-infinite-scroll-component';
import "antd/dist/antd.min.css";
const TextArea = Input.TextArea;
const firebaseConfig = {
  apiKey: "AIzaSyB7U2BxIp7VdA0nLrsuxxfUF6ybNTvTxO8",
  authDomain: "wechat-follow.firebaseapp.com",
  projectId: "wechat-follow",
  storageBucket: "wechat-follow.appspot.com",
  messagingSenderId: "1006898251801",
  appId: "1:1006898251801:web:c20393888d3d40a8588288",
  measurementId: "G-QCZGJCSHVG",
  databaseURL: "https://wechat-follow-default-rtdb.firebaseio.com/",
};
let _autoFollowTimes = null
let _nextAutoFollowTimes = null
const app = initializeApp(firebaseConfig);
export default function App() {
  const db = getDatabase();
  const ContainerHeight = window.innerHeight - 300;
  const [nextAutoFollowTimes, setNextAutoFollowTimes] = useState<number>(0);
  const [autoFollow, setAutoFollow] = useState<boolean>(false);
  const [requestNum, setRequestNum] = useState<number>(0);
  const [addresss, setAddresss] = useState<string>("");
  const [endNum, setEndNum] = useState<number>(200);
  const [loading, setLoading] = useState<boolean>(false);
  const [followAllIn, setFollowAllIn] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [account, setAccount] = useState<string>("");
  const [addressList, setAddressList] = useState<any[]>([]);
  const web3 = new Web3(window.ethereum);
  const onFinish = async () => {
    let addressArr = [...addressList];
    let newAddressArr = []
    var _addresss = addresss.replace(/[^A-Za-z0-9]*/g,"");
    _addresss = _addresss.replaceAll("(\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))", "");
    console.log(_addresss, '---address');
    
    for (let i = 0; i <_addresss.length; i+=42) {
      var address = _addresss.slice(i,i+42);
      if (web3.utils.isAddress(address)) {
        newAddressArr.push(address)
      }
    };
    for (let address of newAddressArr) {
      addressArr.push(address)
      await set(ref(db, "address_list/" + address), address);
    }
    setAddressList(addressArr);
  };

  useEffect(() => {
    onValue(ref(db, "address_list/"), (snapshot) => {
      const data = snapshot.val();
      const formatedData = Object.keys(data).filter(item=>{
        item = item.replace(/[^A-Za-z0-9,]*/g,"");
        item = item.replaceAll("(\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))", "");
        return web3.utils.isAddress(item)
      });
      const map = {};
      formatedData.forEach(item=>{
        item = item.replace(/[^A-Za-z0-9,]*/g,"");
        map[item] = item;
      });
      setAddressList(Object.keys(map));
    });
  }, []);
  const onScrollEnd = async () => {
    document.querySelector(".infinite-scroll-component").scrollTop = document.querySelector(".ant-list.ant-list-split").scrollHeight;
  }
  const autoFollowALl = async () => {
    let nextAutoFollow = !autoFollow;
    setAutoFollow(nextAutoFollow)
    if (nextAutoFollow) {
      await onScrollEnd();
      setTimeout(async ()=>{
        await handleFollowAll();
        setTimeout(async ()=>{
          await autoFollowALl();
        }, 40000)
      }, 40000)
    }
  }
  const handleFollowAll = async ()=>{
    let arr = [...Array.prototype.slice.call(document.querySelectorAll(".ant-list-item-action li"), 0)];
    for (let index of Object.keys(arr)) {
      if (arr[index].innerText === "Follow") {
          arr[index].children[0].children[0].click();
      }
    };
  }
  const onScroll = () => {
    setLoading(true);
    setEndNum(endNum+500)
    setLoading(false)
  }
  return (
    <div className="container">
      <p>基于waha3大佬的开源代码修改的 <a href="https://github.com/waha3/follow" target="_blank">waha3 github</a> | <a href="https://waha3.github.io/follow/" target="_blank">作者原项目github page</a></p>
      <p>如果waha3大佬作者不允许我修改使用，请联系我 我会下掉页面 <a href="mailto:noshufu@gmail.com">请给我发邮件</a></p>
      <div>
        <div style={{width: 800}}>
          {account ? (
            <Button
              style={{
                width: "auto",
              }}
            >
              {account}
            </Button>
          ) : (
            <>
              <h1>Connect with Follow Button</h1>
              <ConnectButton setAccount={setAccount}></ConnectButton>
            </>
          )}
        <div>
          {
            add? (<TextArea onChange={e=>setAddresss(e.target.value)} value={addresss} placeholder="wallet address" />):(
              <Button
                type="dashed"
                onClick={() => setAdd(true)}
                block
                icon={<PlusOutlined />}
              >
                Add Wallet Address
              </Button>
            )
          }
        </div>
      </div>
      <Row justify="space-between">
        <Col span={5}>
          <Button type="primary" onClick={onFinish}>
            Submit
          </Button>
        </Col>
        <Col span={10} offset={2}>
          <Row>
            <Col offset={1}>
              <Button type="primary" onClick={handleFollowAll}>FollowAll</Button>
            </Col>
            <Col offset={1}>
              <Button type="primary" onClick={onScrollEnd}>Scroll End</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
          <Button type="primary" style={{width: "100%"}} onClick={autoFollowALl}>
            {!autoFollow?`Auto Follow(测试功能，不保证稳定性)`: `轮循中，点击关闭功能`}</Button>
          <p style={{color: 'red'}}>请先手动点一次Follow签名后，再点Auto Follow</p>
      </Row>
      </div>
      <InfiniteScroll
        dataLength={addressList.slice(0, endNum).length}
        next={onScroll}
        height={ContainerHeight}
        hasMore={addressList.slice(0, endNum).length < addressList.length}
        loader={<Skeleton paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          style={{width: 800}}
          dataSource={addressList.slice(0, endNum)}
          renderItem={(address, index) => (
            <List.Item
              key={address}
              actions={[
                <FollowButton
                  provider={window.ethereum}
                  namespace="CyberConnect"
                  toAddr={address}
                  env={Env.PRODUCTION}
                  chain={Blockchain.ETH}
                  onSuccess={(e) => {
                    console.log(e);
                    setRequestNum(requestNum+1)
                  }}
                  onFailure={(e) => {
                    console.log(e);
                    setRequestNum(requestNum+1)
                  }}
                />,
              ]}
            >
              {address}
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
}
