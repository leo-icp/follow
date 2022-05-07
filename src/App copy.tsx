import { useEffect, useState } from "react";
import "./styles.css";
import ConnectButton from "./components/ConnectButton";
import {
  FollowButton,
  Env,
  Blockchain,
} from "@cyberconnect/react-follow-button";
import { Form, Input, Button, Space, List } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

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

const app = initializeApp(firebaseConfig);

export default function App() {
  const db = getDatabase();
  const [account, setAccount] = useState<string>("");
  const [addressList, setAddressList] = useState<string[]>([]);
  const onFinish = (values: { list: { address: string }[] }) => {
    const list = values.list.map((val) => val.address);
    setAddressList(list);

    for (let i of list) {
      set(ref(db, "address_list/" + i), i);
    }
  };

  useEffect(() => {
    // onValue(ref(db, "address_list/"), (snapshot) => {
    //   const data = snapshot.val();
    //   const formatedData = Object.keys(data);
    //   setAddressList(formatedData);
    // });
  }, []);

  return (
    <div className="container">
      <div>
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
        <Form
          name="dynamic_form_nest_item"
          onFinish={onFinish}
          autoComplete="off"
          style={{
            marginTop: 10,
            width: 800,
          }}
        >
          <Form.List name="list">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex" }} align="baseline">
                    <Form.Item
                      style={{
                        width: 800,
                      }}
                      {...restField}
                      name={[name, "address"]}
                      rules={[{ required: true, message: "Missing address" }]}
                    >
                      <TextArea placeholder="wallet address" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Wallet Address
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <List
        style={{
          width: 800,
        }}
        header="follow list"
        dataSource={addressList}
        renderItem={(address, index) => (
          <List.Item
            key={index}
            actions={[
              <FollowButton
                provider={window.ethereum}
                namespace="CyberConnect"
                toAddr={address}
                env={Env.PRODUCTION}
                chain={Blockchain.ETH}
                onSuccess={(e) => {
                  console.log(e);
                }}
                onFailure={(e) => {
                  console.log(e);
                }}
              />,
            ]}
          >
            {address}
          </List.Item>
        )}
      ></List>
    </div>
  );
}
