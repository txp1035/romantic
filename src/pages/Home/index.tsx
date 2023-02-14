import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import { useEffect } from 'react';
import Heart from './a.js';
import { Modal } from 'antd';

const HomePage: React.FC = () => {
  useEffect(() => {
    const heart = new Heart();
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
  }, []);
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <canvas id="heart"></canvas>
        <audio loop>
          <source src="/heart.mp3" type="audio/mpeg" />
        </audio>
      </div>
    </PageContainer>
  );
};

export default HomePage;
