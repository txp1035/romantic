import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import { useEffect, useState } from 'react';
import Heart from './a.js';
// import { Modal, Spin } from 'antd';
import { Modal, Toast } from 'antd-mobile';
import { useLocation } from '@umijs/max';
import second from './weixin.png';
import hash from 'object-hash';
import moment from 'dayjs';

import qs from 'query-string';

let heart;
const HomePage: React.FC = () => {
  const [first, setfirst] = useState(true);
  const location = useLocation();

  const obj = qs.parse(location.search);
  const strHour = moment().format('YYYY-MM-DD HH');
  const shortHashHour = hash(strHour).slice(0, 7).toLocaleUpperCase();
  const isHide = obj?.d?.toLocaleUpperCase() === shortHashHour;
  console.log(123, obj);
  if (obj?.b === 'txp1035') {
    obj.i = '哥哥';
    obj.you = '宝宝';
    obj.action = 'love';
  }
  useEffect(() => {
    Toast.show({
      icon: 'loading',
      content: '加载中…',
      duration: 0,
    });
    heart = new Heart();

    setfirst(false);
  }, []);
  useEffect(() => {
    if (!first) {
      Toast.clear();
      Modal.confirm({
        title: '是否播放心跳声',
        onCancel: () => {
          heart.draw();
        },
        onConfirm: () => {
          heart.draw();
          const a = document.querySelector('audio');
          a.play();
        },
      });
    }
  }, [first]);
  return (
    <PageContainer ghost>
      {/* <Spin tip="加载中" spinning={first}> */}
      <div className={styles.container}>
        <h1>
          {obj.i} {obj.action || '喜欢'} {obj.you}
        </h1>
        <canvas id="heart"></canvas>
        <audio loop>
          <source src="/heart.mp3" type="audio/mpeg" />
        </audio>
        {!isHide && (
          <>
            <img src={second} alt="" width="100%" />
            <span>关注公众号回复【heart】去掉二维码</span>
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default HomePage;
