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

export default function Arco({ obj, submit }) {
  const [form] = useForm();
  const allTips = {
    copyTips: () => {
      Toast['success']('复制连接成功，到微信发送给你要分享的朋友');
    },
    errorTips: () => {
      Toast['error']('失败请联系作者');
    },
    editTips: () => {
      Toast['error']('要修改了内容才能浏览');
    },
  };
  return (
    <Form initialValues={obj} form={form} layout="vertical">
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

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ marginRight: 10 }}
          bgColor="#1e80ff"
          inline
          size="medium"
          onClick={() => {
            const values = form.getFieldsValue();
            submit({
              btn: 'view',
              values,
              ...allTips,
            });
          }}>
          浏览效果
        </Button>
        <Button
          inline
          size="medium"
          bgColor="#00b578"
          onClick={() => {
            const values = form.getFieldsValue();
            submit({
              btn: 'copy',
              values,
              ...allTips,
            });
          }}>
          分享到微信
        </Button>
      </div>
    </Form>
  );
}
