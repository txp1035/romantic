import { useEffect, useState } from 'react';
import hash from 'object-hash';
import moment from 'dayjs';
import qs from 'query-string';
import { Modal } from 'antd-mobile';
import Dialog from '@arco-design/mobile-react/esm/dialog';
import Arco from './Arco';
import Antd from './Antd';
import './index.less';
import { Heart, TypeWriting, CONSTANT, copyText } from './utils';

let heart;
let typeWriting;

const isJuejin = false;

const HomePage: React.FC = () => {
  const [isClick, setIsClick] = useState(false);
  const [first, setfirst] = useState(true);
  // 浏览模式和编辑模式切换 false是浏览
  const [mode, setMode] = useState(false);
  const [obj, setObj] = useState({
    tips: '你是否准备好了？',
    title: '码上掘金',
    content:
      '码上掘金是由稀土掘金推出的在线code playground服务，在这里，无需搭建复杂的开发环境即可实现代码效果的即时预览、演示。\n如何用「码上掘金」玩出花？\n快来参与竞赛，将灵感变为现实！\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长',
    color: ['#ee879d', '#f50', 'orange', 'gold', '#87d068', 'teal', '#108ee9', 'purple'],
    music: CONSTANT.music,
    ...qs.parse(location.search),
  });

  useEffect(() => {
    setfirst(false);

    document.body.setAttribute('style', ` background-image: url('/bg.jpg');`);
    document.title = obj.title;
  }, []);
  useEffect(() => {
    if (mode) {
      document.body.setAttribute('style', ` background-image: url('/bg.jpg');`);
      document.title = obj.title;
      setMode(false);
      heart.clear();
    }
  }, [JSON.stringify(obj)]);
  useEffect(() => {
    if (!first && !mode) {
      heart = new Heart({
        width: window.innerWidth * 0.8,
        color: obj?.color || ['#ee879d', '#f50', 'orange', 'gold', '#87d068', 'teal', '#108ee9', 'purple'],
        mp3: CONSTANT.heart,
      });
      const data = obj.content;
      typeWriting = new TypeWriting({
        select: '#content',
        content: data,
        mp3: CONSTANT.type,
        writing: () => {
          // 打字监听触底
          const $content = document.querySelector('#content');
          const $noContent = document.querySelector('#noContent');
          const $root = document.querySelector('#root');
          const all = $root?.clientHeight - 24 - $noContent.scrollHeight;
          if (all < $content?.scrollHeight) {
            $root.scrollTop = $root.scrollHeight;
          }
        },
      });
      if (!isJuejin) {
        Modal.alert({
          title: obj.tips,
          onConfirm: () => {
            setIsClick(true);
            const music = document.querySelector('#music');
            music?.setAttribute('src', obj.music || CONSTANT.music);
            music.play();
            heart.draw();
            typeWriting.run();
          },
        });
      } else {
        Dialog.alert({
          title: obj.tips,
          platform: 'ios',
          onOk: () => {
            setIsClick(true);
            const music = document.querySelector('#music');
            music.play();
            heart.draw();
            typeWriting.run();
          },
        });
      }
    }
  }, [first, mode]);

  const strHour = moment().format('YYYY-MM-DD HH');
  const shortHashHour = hash(strHour).slice(0, 7).toLocaleUpperCase();
  const isHide = obj?.captcha?.toLocaleUpperCase() !== shortHashHour;
  const submit = ({ values = {}, copyTips, errorTips, btn, editTips }) => {
    const filterValues = Object.fromEntries(Object.entries(values).filter((item) => !!String(item[1]).replaceAll(' ', '')));
    const newObj = {
      ...filterValues,
    };
    if (typeof filterValues.color === 'string') {
      newObj.color = filterValues?.color?.split(',').filter((item) => !!item);
    }
    if (btn === 'view') {
      if (JSON.stringify(newObj) === JSON.stringify(obj)) {
        editTips();
      } else {
        setObj(newObj);
      }
    }
    if (btn === 'copy') {
      const text = `${CONSTANT.url}/heart?${qs.stringify(newObj)}`;
      try {
        copyText(text);
        copyTips();
      } catch (error) {
        errorTips();
      }
    }
  };
  return (
    <div className="container">
      {!mode && (
        <>
          <div id="noContent">
            {isClick && <h1>{obj.title}</h1>}
            <canvas id="heart"></canvas>
            <audio loop id="music" src={CONSTANT.music}></audio>
          </div>
          <h2 id="content"></h2>
        </>
      )}
      {mode && !isJuejin && <Antd obj={obj} setObj={setObj} submit={submit} />}
      {mode && isJuejin && <Arco obj={obj} setObj={setObj} submit={submit} />}
      <h3>
        <div className="author">
          {!mode && (
            <div>
              <a
                onClick={() => {
                  if (!mode) {
                    // 要发掘金不能直接给body赋值
                    document.body.setAttribute('style', `background: #fff;`);
                    setMode(true);
                    typeWriting.stop();
                    heart.clear();
                  }
                }}>
                自定义此页面
              </a>
            </div>
          )}
          {isHide && (
            <div>
              由公众号
              <a
                onClick={() => {
                  if (!isJuejin) {
                    Modal.alert({
                      title: <img src={CONSTANT.weixin} alt="二维码" width="100%" />,
                    });
                  } else {
                    Dialog.alert({
                      title: <img src={CONSTANT.weixin} alt="二维码" width="100%" />,
                      platform: 'ios',
                    });
                  }
                }}>
                「道源1035」
              </a>
              提供支持【v1.0.1】
            </div>
          )}
        </div>
      </h3>
    </div>
  );
};

export default HomePage;
