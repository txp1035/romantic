export class Heart {
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
    // 一秒24到30帧比较好，目前是200毫秒一个画面，一秒6个画面
    this.fps = 6;
    this.time = 200;
    // 方便分段调试的参数
    // this.isHidePoints = true
    // this.isHideEdgePoints = true
    // this.isHideCenterPoints = true
    // this.isHideAroundPoints = true
  }

  private init({ color = ['#ee879d'], mp3 }) {
    // 画布
    const canvas = document.querySelector('#heart');
    canvas.height = this.canvasHeight;
    canvas.width = this.canvasWidth;
    this.context = canvas.getContext('2d');
    this.timer = null;
    this.color = color;
    this.body = document.querySelector('body');
    if (mp3) {
      this.audio = document.createElement('audio');
      this.audio.setAttribute('src', mp3);
      this.audio.setAttribute('loop', true);
      this.body.appendChild(this.audio);
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
    let color = 0;
    if (this.audio) {
      this.audio.play();
    }
    // 画图前保证计时器没有运作
    clearInterval(this.timer);
    // 500毫秒渲染一次画面
    this.timer = setInterval(() => {
      // 渲染新画面前，情况老画面
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      if (f % 6 === 1) {
        // 6个画面切换颜色
        this.context.fillStyle = this.color[color % this.color.length];
        color++;
      }
      this.render(f++);
    }, this.time);
  }
  clear() {
    clearInterval(this.timer);
    if (this.audio) {
      this.body.removeChild(this.audio);
      this.audio = null;
    }
    this.timer = null;
  }
}

export class TypeWriting {
  constructor({ select, content, mp3, writing = () => {} }) {
    this.select = select;
    this.writing = writing;
    this.dom = document.querySelector(select);
    this.content = content.split('');
    if (mp3) {
      this.body = document.querySelector('body');
      this.audio = document.createElement('audio');
      this.audio.setAttribute('src', mp3);
      this.audio.setAttribute('loop', true);
      this.body.appendChild(this.audio);
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
      this.body.removeChild(this.audio);
      this.audio = null;
    }
  }
  run() {
    if (this.audio) {
      this.audio.play();
    }
    this.writer(0, this);
  }
}

const url = 'https://romantic.imtxp.cn';

export const CONSTANT = {
  url,
  music: `${url}/music.mp3`,
  heart: `${url}/heart.mp3`,
  type: `${url}/type.mp3`,
  weixin: `${url}/weixin.png`,
};

export const copyText = function (content: string) {
  if (!navigator.clipboard) {
    // 降级
    let textarea = document.createElement('textarea');
    // 隐藏此输入框
    textarea.style.width = 0;
    textarea.style.position = 'fixed';
    textarea.style.left = '-1035px';
    textarea.style.top = '1035px';
    textarea.setAttribute('readonly', 'readonly');
    // 插入元素
    document.body.appendChild(textarea);
    // 赋值
    textarea.value = content;
    // 选中
    textarea.select();
    // 复制
    document.execCommand('copy', true);
  } else {
    navigator.clipboard.writeText(content).then(
      function () {},
      function () {
        // 禁止写入剪切板后使用兜底方法
        copyText(content, false);
      }
    );
  }
};
