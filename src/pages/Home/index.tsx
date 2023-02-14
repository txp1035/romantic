import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import { useEffect, useState } from 'react';
import Heart from './a.js';
import { Modal, Spin } from 'antd';
let heart;
const HomePage: React.FC = () => {
  const [first, setfirst] = useState(true);

  useEffect(() => {
    heart = new Heart();
    setfirst(false);
  }, []);
  useEffect(() => {
    if (!first) {
      Modal.confirm({
        title: '是否播放心跳声',
        onCancel: () => {
          heart.draw();
        },
        onOk: () => {
          heart.draw();
          const a = document.querySelector('audio');
          a.play();
        },
      });
    }
  }, [first]);
  return (
    <PageContainer ghost>
      <Spin tip="加载中" spinning={first}>
        <div className={styles.container}>
          <canvas id="heart"></canvas>
          <audio loop>
            <source src="/heart.mp3" type="audio/mpeg" />
          </audio>
        </div>
      </Spin>
    </PageContainer>
  );
};

export default HomePage;
