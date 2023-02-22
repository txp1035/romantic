import styles from './index.less';
import { useEffect, useState } from 'react';
import { Modal, Toast, Form, Input, TextArea, Button, Space } from 'antd-mobile';
import hash from 'object-hash';
import moment from 'dayjs';
import qs from 'query-string';

class Heart {
  private config({ width }) {
    // 画布宽度
    this.canvasWidth = width;
    // 画布高度
    this.canvasHeight = (this.canvasWidth / 33) * 30;
    // 爱心宽度
    this.width = this.canvasWidth / 1.3;
    // 爱心高度
    this.height = this.canvasHeight / 1.3;
    // 中心点x位置
    this.centerX = this.canvasWidth / 2;
    // 中心点y位置
    this.centerY = this.canvasHeight / 2;
    // canvas设置
    this.initPointsCount = (this.width / 370) * 2000;
    // 中心点数量
    this.initCenterPointsCount = (this.width / 370) * 5000;
    // 心跳幅度控制
    this.heartbeatAmplitude = (this.width / 370) * 5;
    // 放大倍数
    this.multiple = this.width / 33;
    // 外边框放大倍数
    this.aroundMultiple = this.multiple + (this.width / 370) * 0.5;
    // 总画面数，一共5个画面，完成从膨胀到收缩的过程，6帧最小的时候多一个停顿感
    // 一秒24到30帧比较好，目前是200毫秒一个画面，一秒5个画面
    this.fps = 30;
    this.time = 200;
    // 方便分段调试的参数
    // this.isHidePoints = true
    // this.isHideEdgePoints = true
    // this.isHideCenterPoints = true
    // this.isHideAroundPoints = true
  }

  private init({ color = 'RGBA(252, 107, 113, 1.00)', mp3 }) {
    // 画布
    const canvas = document.querySelector('#heart');
    canvas.height = this.canvasHeight;
    canvas.width = this.canvasWidth;
    this.context = canvas.getContext('2d');
    this.context.moveTo(0, 0);
    this.context.fillStyle = color;
    this.timer = null;

    if (mp3) {
      const body = document.querySelector('body');
      this.audio = document.createElement('audio');
      this.audio.setAttribute('src', mp3);
      this.audio.setAttribute('loop', true);
      body.appendChild(this.audio);
    }

    // 点位等
    this.points = [];
    this.edgePoints = [];
    this.centerPoints = [];
    this.fpsPoints = {};
    this.initPoints(this.initPointsCount);
    this.initEdgePoints();
    this.initCenterPoints(this.initCenterPointsCount);
    for (let index = 1; index <= this.fps; index++) {
      this.initFpsPoints(index);
    }
  }
  constructor({ width, color, mp3 }) {
    this.config({ width });
    this.init({ color, mp3 });
  }

  // 输入一个范围，返回这个范围的随机值
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }
  // 输入一个整数，得到随机整数数，如3，返回1,2,3，正负也随机
  static randomInt(max) {
    const num = Math.floor(Math.random() * (max + 1));
    const symbol = !!Math.floor(Math.random() * 2) ? 1 : -1;
    return symbol * num;
  }
  // 运动函数
  static sport(k) {
    return ((2 * (2 * Math.sin(4 * k))) / 2) * Math.PI;
  }

  // 传入角度，生成爱心单个点位
  private generatePoint(t, multiple = this.multiple) {
    let x = 16 * Math.sin(t) ** 3;
    // 因为canvas的y轴向下为正向上为负所以要加一个负号
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      // 默认爱心宽：33，高：30
      // 给坐标放大倍数、从画布中心点开始画
      x: x * multiple + this.centerX,
      y: y * multiple + this.centerY - 3 * multiple,
    };
  }
  // 传入一个点位，倍数，得到一个向内扩散的随机点位，默认倍数是爱心的5%
  // 600 0.05到0.17（趋于圆心）
  private expand(x, y, multiple = 0.05) {
    // 0到1的对数负无穷大到0，乘以负倍数得到扩大倍数
    // 对数营造边缘点数多中心点数少的感觉，-1，-2，-3相对比较多
    // 倍数要保持在0.2往下，为了控制倍数范围在0到1之间
    const xMultiple = -multiple * Math.log(Heart.random(0, 1));
    const yMultiple = -multiple * Math.log(Heart.random(0, 1));
    // 得到点位距离进行扩大的新距离
    const dx = xMultiple * (x - this.centerX);
    const dy = yMultiple * (y - this.centerX);
    // 返回缩小后的点位
    return {
      x: parseInt(x - dx),
      y: parseInt(y - dy),
    };
  }
  // 向外扩散，传入xy和倍数，得到新的点
  private shrink(x, y, range) {
    const k = -1 / ((x - this.centerX) ** 2 + (y - this.centerY) ** 2) ** 0.6;

    const dx = range * k * (x - this.centerX);
    const dy = range * k * (y - this.centerY);

    return {
      x: parseInt(x - dx),
      y: parseInt(y - dy),
    };
  }
  // 传入位置、比例获取最新位置
  private getCurrentPosition(x, y, range) {
    const k = 1 / ((x - this.centerX) ** 2 + (y - this.centerY) ** 2) ** 0.52;
    const dx = range * k * (x - this.centerX) + Heart.randomInt(1);
    const dy = range * k * (y - this.centerY) + Heart.randomInt(1);
    return {
      x: parseInt(x - dx),
      y: parseInt(y - dy),
    };
  }
  private initPoints(count = 360) {
    for (let i = 0; i < count; i++) {
      const t = Heart.random(0, 2 * Math.PI);
      this.points.push(this.generatePoint(t));
    }
  }
  private initEdgePoints() {
    this.points.forEach((point) => {
      for (let index = 0; index < 3; index++) {
        // 让点位向内扩散
        const res = this.expand(point.x, point.y);
        this.edgePoints.push({
          x: res.x,
          y: res.y,
        });
      }
    });
  }
  private initCenterPoints(n) {
    for (let index = 0; index < n; index++) {
      const point = this.points[Math.floor(Math.random() * this.points.length)];
      const res = this.expand(point.x, point.y, 0.17);
      this.centerPoints.push({
        x: res.x,
        y: res.y,
      });
    }
  }
  private initFpsPoints(f) {
    // 控制心跳幅度，最后一个随机
    const range = (this.heartbeatAmplitude * Heart.sport((f / 10) * Math.PI)) / 1;
    // 得到半径
    const radius = parseInt(4 + 6 * (1 + Heart.sport((f / 10) * Math.PI)));
    const allPoints = [];
    const aroundPoints = [];
    const number = this.isHideAroundPoints ? 0 : parseInt(3000 + 4000 * Math.abs(Heart.sport((f / 10) * Math.PI) ** 2));
    for (let index = 0; index < number; index++) {
      const t = Heart.random(0, 4 * Math.PI);
      const point = this.generatePoint(t, this.aroundMultiple);
      const res = this.shrink(point.x, point.y, radius);
      if (aroundPoints.every((point) => point.x !== res.x && point.y !== res.y)) {
        aroundPoints.push({
          x: res.x,
          y: res.y,
        });
        // 外边框宽度点数随机生成
        const x = res.x + Heart.randomInt(28);
        const y = res.y + Heart.randomInt(28);
        const size = [1, 2, 2][Math.floor(Math.random() * 3)];
        allPoints.push({
          x,
          y,
          size,
        });
      }
    }

    if (!this.isHidePoints) {
      this.points.forEach((point) => {
        // 让点位运动起来
        const res = this.getCurrentPosition(point.x, point.y, range);
        const size = [1, 2, 3][Math.floor(Math.random() * 3)];
        allPoints.push({
          x: res.x,
          y: res.y,
          size,
        });
      });
    }
    // 添加边缘点位到渲染里
    if (!this.isHideEdgePoints) {
      this.edgePoints.forEach((point) => {
        const res = this.getCurrentPosition(point.x, point.y, range);
        const size = [1, 2][Math.floor(Math.random() * 2)];
        allPoints.push({
          x: res.x,
          y: res.y,
          size,
        });
      });
    }

    // 添加中心点位到渲染里
    if (!this.isHideCenterPoints) {
      this.centerPoints.forEach((point) => {
        const res = this.getCurrentPosition(point.x, point.y, range);
        const size = [1, 2][Math.floor(Math.random() * 2)];
        allPoints.push({
          x: res.x,
          y: res.y,
          size,
        });
      });
    }

    this.fpsPoints[f] = allPoints;
  }
  private render(f) {
    // 重复渲染帧数对应的点位状态
    this.fpsPoints[(f % this.fps) + 1].forEach((point) => {
      // 填充这一帧里的点位x y 宽 高
      this.context.fillRect(point.x, point.y, point.size, point.size);
    });
  }
  draw() {
    let f = 1;
    if (this.audio) {
      this.audio.play();
    }
    // 画图前保证计时器没有运作
    clearInterval(this.timer);
    // 500毫秒渲染一次画面
    this.timer = setInterval(() => {
      // 渲染新画面前，情况老画面
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.render(f++);
    }, this.time);
  }
  clear() {
    clearInterval(this.timer);
    if (this.audio) {
      this.audio.pause();
    }
    this.timer = null;
  }
}

class TypeWriting {
  constructor({ select, content, mp3, writing = () => {} }) {
    this.select = select;
    this.writing = writing;
    this.dom = document.querySelector(select);
    this.content = content.split('');
    if (mp3) {
      const body = document.querySelector('body');
      this.audio = document.createElement('audio');
      this.audio.setAttribute('src', mp3);
      this.audio.setAttribute('loop', true);
      body.appendChild(this.audio);
    }
  }
  private writer(index, that) {
    if (that.isStop) {
      return;
    }
    that.writing();
    if (index < that.content.length) {
      const str = that.content[index] === '\n' ? '<br/>' : that.content[index];
      that.dom.innerHTML += str;
      setTimeout(that.writer, 80, index + 1, that);
    } else {
      if (that.audio) {
        that.audio.pause();
      }
    }
  }
  stop() {
    this.isStop = true;
    if (this.audio) {
      this.audio.pause();
    }
  }
  run() {
    if (this.audio) {
      this.audio.play();
    }
    this.writer(0, this);
  }
}

let btn;
let heart;
let typeWriting;

const HomePage: React.FC = () => {
  const [isClick, setIsClick] = useState(false);
  const [first, setfirst] = useState(true);
  // 浏览模式和编辑模式切换 false是浏览
  const [mode, setMode] = useState(false);
  const objQs = qs.parse(location.search);
  const [obj, setObj] = useState({
    tips: '你是否准备好了？',
    title: '码上掘金',
    content:
      '码上掘金是由稀土掘金推出的在线code playground服务，在这里，无需搭建复杂的开发环境即可实现代码效果的即时预览、演示。\n如何用「码上掘金」玩出花？\n快来参与竞赛，将灵感变为现实！\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长\n测试超长',
    ...objQs,
  });
  useEffect(() => {
    if (mode) {
      setMode(false);
      heart.clear();
    }
  }, [JSON.stringify(obj)]);

  const strHour = moment().format('YYYY-MM-DD HH');
  const shortHashHour = hash(strHour).slice(0, 7).toLocaleUpperCase();
  const isHide = obj?.captcha?.toLocaleUpperCase() !== shortHashHour;

  useEffect(() => {
    Toast.show({
      icon: 'loading',
      content: '加载中…',
      duration: 0,
    });
    setfirst(false);
    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    if (!first && !mode) {
      heart = new Heart({
        width: window.innerWidth * 0.8,
        color: '#ee879d',
        mp3: '/heart.mp3',
      });
      const data = obj.content;
      typeWriting = new TypeWriting({
        select: '#content',
        content: data,
        mp3: '/type.mp3',
        writing: () => {
          // 打字监听触底
          const $content = document.querySelector('#content');
          const $root = document.querySelector('#root');
          const $noContent = document.querySelector('#noContent');
          const all = $root?.clientHeight - 24 - $noContent.scrollHeight;
          if (all < $content?.scrollHeight) {
            $root.scrollTop = $root.scrollHeight;
          }
        },
      });
      Toast.clear();
      Modal.alert({
        title: obj.tips,
        onConfirm: () => {
          setIsClick(true);
          const music = document.querySelector('#music');
          music.play();
          heart.draw();
          typeWriting.run();
        },
      });
    }
  }, [first, mode]);

  return (
    <div className={styles.container}>
      {!mode && (
        <>
          <div id="noContent">
            {isClick && <h1>{obj.title}</h1>}
            <canvas id="heart"></canvas>
            <audio loop id="music">
              <source src="/music.mp3" type="audio/mpeg" />
            </audio>
          </div>
          <h2 id="content"></h2>
        </>
      )}
      {mode && (
        <>
          <div id="copyText"></div>
          <Form
            initialValues={obj}
            onFinish={(values: any) => {
              if (btn === 'view') {
                setObj(values);
              }
              if (btn === 'copy') {
                const text = `http://heart.imtxp.cn/?${qs.stringify(values)}`;
                try {
                  if (navigator.clipboard) {
                    // clipboard api 复制
                    navigator.clipboard.writeText(text);
                    Toast.show({
                      icon: 'success',
                      content: '复制成功',
                    });
                  } else {
                    const textarea = document.createElement('textarea');
                    document.body.appendChild(textarea);
                    // 隐藏此输入框
                    textarea.style.position = 'fixed';
                    textarea.style.clip = 'rect(0 0 0 0)';
                    textarea.style.top = '10px';
                    // 赋值
                    textarea.value = text;
                    // 选中
                    textarea.select();
                    // 复制
                    document.execCommand('copy', true);
                    // 移除输入框
                    document.body.removeChild(textarea);
                    Toast.show({
                      icon: 'success',
                      content: '复制成功',
                    });
                  }
                } catch (error) {
                  Toast.show({
                    icon: 'fail',
                    content: '失败请联系作者',
                  });
                }
              }
            }}
            footer={
              <Space wrap justify="center" block align="center">
                <Button
                  block
                  onClick={() => {
                    btn = 'view';
                  }}
                  type="submit"
                  color="primary">
                  浏览效果
                </Button>
                <Button
                  block
                  onClick={() => {
                    btn = 'copy';
                  }}
                  type="submit"
                  color="success">
                  复制链接
                </Button>
              </Space>
            }>
            <Form.Item name="tips" label="提示" rules={[{ required: true, message: '提示不能为空' }]}>
              <Input placeholder="请输入提示" />
            </Form.Item>
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '标题不能为空' }]}>
              <Input placeholder="请输入标题" />
            </Form.Item>
            <Form.Item name="content" label="内容" help="详情内容" rules={[{ required: true, message: '内容不能为空' }]}>
              <TextArea
                placeholder="请输入内容"
                // maxLength={100}
                rows={10}
                showCount
              />
            </Form.Item>
            <Form.Item name="captcha" label="影藏作者信息(关注公众号，发送heart获取解除验证码)">
              <Input placeholder="输入验证码" />
            </Form.Item>
          </Form>
        </>
      )}
      {isClick && (
        <h3>
          <div className={styles.author}>
            {!mode && (
              <div>
                <a
                  onClick={() => {
                    if (!mode) {
                      setMode(true);
                      typeWriting.stop();
                      heart.clear();
                    }
                  }}>
                  点击生成你的专属情书（基于此模板）
                </a>
              </div>
            )}
            {isHide && <div>欢迎关注作者公众号「道源1035」发现好玩的东西</div>}
          </div>
        </h3>
      )}
    </div>
  );
};

export default HomePage;
