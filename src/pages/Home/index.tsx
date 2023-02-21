import Heart from './a.js';
import second from './weixin.png';
import styles from './index.less';
import { useEffect, useState } from 'react';
import { Modal, Toast, Form, Input, TextArea, Button } from 'antd-mobile';
// import { useLocation } from '@umijs/max';
// import hash from 'object-hash';
// import moment from 'dayjs';
// import qs from 'query-string';

let heart;
const HomePage: React.FC = () => {
  const [first, setfirst] = useState(true);
  const [mode, setMode] = useState(false);
  const [obj, setObj] = useState({
    title: '码上掘金',
    content:
      '码上掘金是由稀土掘金推出的在线code playground服务，在这里，无需搭建复杂的开发环境即可实现代码效果的即时预览、演示。\n如何用「码上掘金」玩出花？\n快来参与竞赛，将灵感变为现实！\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n1',
  });
  useEffect(() => {
    if (mode) {
      setMode(false);
      heart.clear();
    }
  }, [JSON.stringify(obj)]);

  // const location = useLocation();

  // const strHour = moment().format('YYYY-MM-DD HH');
  // const shortHashHour = hash(strHour).slice(0, 7).toLocaleUpperCase();
  // const isHide = obj?.code?.toLocaleUpperCase() === shortHashHour;

  useEffect(() => {
    Toast.show({
      icon: 'loading',
      content: '加载中…',
      duration: 0,
    });
    // const obj = qs.parse(location.search);
    setfirst(false);
  }, []);
  useEffect(() => {
    if (!first && !mode) {
      heart = new Heart();
      Toast.clear();
      Modal.confirm({
        title: '是否播放心跳声',
        onCancel: () => {
          heart.draw();
        },
        onConfirm: () => {
          heart.draw();
          const hearts = document.querySelector('#hearts');
          hearts.play();
          const music = document.querySelector('#music');
          music.play();
          const data = obj.content.split('');
          console.log(data);
          const dom = document.querySelector('#content');
          const type = document.querySelector('#type');
          type.play();
          function writer(index) {
            const $root = document.querySelector('#root');

            const $noContent = document.querySelector('#noContent');
            const all = $root?.clientHeight - 24 - $noContent.scrollHeight;

            if (all < dom?.scrollHeight) {
              $root.scrollTop = $root.scrollHeight;
            }

            if (index < data.length) {
              const str = data[index] === '\n' ? '<br/>' : data[index];
              dom.innerHTML += str;
              setTimeout(writer, 80, index + 1);
            } else {
              type.pause();
            }
          }
          writer(0);
        },
      });
    }
  }, [first, mode]);

  return (
    <div className={styles.container}>
      {!mode && (
        <>
          <div id="noContent">
            <h1>{obj.title}</h1>
            <canvas id="heart"></canvas>
            <audio loop id="hearts">
              <source src="/heart.mp3" type="audio/mpeg" />
            </audio>
            <audio loop id="music">
              <source src="/music.mp3" type="audio/mpeg" />
            </audio>
            <audio loop id="type">
              <source src="/type.mp3" type="audio/mpeg" />
            </audio>
          </div>
          <h2 id="content"></h2>
          <h3>
            <div className={styles.author}>作者：道源</div>
            <div>
              <a
                onClick={() => {
                  setMode(true);
                }}
              >
                点击生成你的专属情书
              </a>
            </div>
          </h3>
          {false && (
            <>
              <img src={second} alt="" width="100%" />
              <span>关注公众号回复【heart】去掉二维码</span>
            </>
          )}
        </>
      )}
      {mode && (
        <>
          <Form
            initialValues={obj}
            onFinish={(values: any) => {
              setObj(values);
            }}
            footer={
              <Button block type="submit" color="primary" size="large">
                提交
              </Button>
            }
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '标题不能为空' }]}
            >
              <Input onChange={console.log} placeholder="请输入标题" />
            </Form.Item>
            <Form.Item
              name="content"
              label="内容"
              help="详情内容"
              rules={[{ required: true, message: '内容不能为空' }]}
            >
              <TextArea
                placeholder="请输入内容"
                // maxLength={100}
                rows={10}
                showCount
              />
            </Form.Item>
          </Form>
          <h3>
            <div className={styles.author}>作者：道源</div>
            <div>
              <a
                onClick={() => {
                  setMode(false);
                  heart.clear();
                }}
              >
                点击浏览你的专属情书
              </a>
            </div>
          </h3>
        </>
      )}
    </div>
  );
};

export default HomePage;
