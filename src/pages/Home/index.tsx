import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';
import { useEffect } from 'react';
import Heart from './a.js';
import { Modal } from 'antd';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  useEffect(() => {
    const heart = new Heart();
    Modal.info({
      title: 123,
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
        <audio autoplay="autoplay" loop="loop">
          <source src="/heart.mp3" type="audio/mpeg" />
        </audio>
      </div>
    </PageContainer>
  );
};

export default HomePage;
