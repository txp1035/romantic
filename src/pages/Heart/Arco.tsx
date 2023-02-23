import setRootPixel from '@arco-design/mobile-react/tools/flexible';
setRootPixel();
import Button from '@arco-design/mobile-react/esm/button';
import '@arco-design/mobile-react/esm/button/style';
import '@arco-design/mobile-react/esm/dialog/style';
import Toast from '@arco-design/mobile-react/esm/toast';
import '@arco-design/mobile-react/esm/toast/style';
import Form, { useForm } from '@arco-design/mobile-react/esm/form';
import '@arco-design/mobile-react/esm/form/style';
import Input from '@arco-design/mobile-react/esm/input';
import '@arco-design/mobile-react/esm/input/style';
import Textarea from '@arco-design/mobile-react/esm/textarea';
import '@arco-design/mobile-react/esm/textarea/style';

let btn;

export default function Arco({ obj, submit }) {
  const [form] = useForm();
  return (
    <Form
      initialValues={obj}
      style={{ background: '#fff' }}
      form={form}
      onSubmit={(values) => {
        submit({
          btn,
          values,
          copyTips: () => {
            Toast['success']('复制成功');
          },
          errorTips: () => {
            Toast['error']('失败请联系作者');
          },
        });
      }}
      layout="vertical">
      <Form.Item field="tips" label="提示" required>
        <Input placeholder="请输入提示" />
      </Form.Item>
      <Form.Item field="title" label="标题" required>
        <Input placeholder="请输入标题" />
      </Form.Item>
      <Form.Item field="content" label="内容" required>
        <Textarea rows={10} placeholder="请输入内容" />
      </Form.Item>
      <Form.Item field="captcha" label="影藏作者信息(关注公众号，发送heart获取解除验证码)">
        <Input placeholder="输入验证码" />
      </Form.Item>
      <Form.Item field="music" label="背景音乐">
        <Input placeholder="输入背景音乐连接" />
      </Form.Item>
      <Form.Item field="color" label="心跳颜色">
        <Input placeholder="输入心跳颜色" />
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          inline
          size="medium"
          onClick={() => {
            btn = 'view';
            form.submit();
          }}>
          浏览效果
        </Button>
        <Button
          inline
          size="medium"
          onClick={() => {
            btn = 'copy';
            form.submit();
          }}>
          复制链接分享给微信朋友
        </Button>
      </div>
    </Form>
  );
}
