import { Toast, Form, Input, TextArea, Button, Space } from 'antd-mobile';

export default function Antd({ obj, submit }) {
  const [form] = Form.useForm();
  const allTips = {
    copyTips: () => {
      Toast.show({
        icon: 'success',
        content: '复制连接成功，到微信发送给你要分享的朋友',
      });
    },
    errorTips: () => {
      Toast.show({
        icon: 'fail',
        content: '失败请联系作者',
      });
    },
    editTips: () => {
      Toast.show({
        icon: 'fail',
        content: '要修改了内容才能浏览',
      });
    },
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: 110 }}>
      <Form style={{ height: '70vh', overflow: 'auto', width: '80%', marginBottom: 20 }} form={form} initialValues={obj}>
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
        <Form.Item name="music" label="背景音乐">
          <Input placeholder="输入背景音乐连接" />
        </Form.Item>
        <Form.Item name="color" label="心跳颜色">
          <Input placeholder="输入心跳颜色" />
        </Form.Item>
      </Form>

      <Space wrap block justify="center" align="center">
        <Button
          onClick={() => {
            const values = form.getFieldsValue();
            submit({
              values,
              btn: 'view',
              ...allTips,
            });
          }}
          type="submit"
          color="primary">
          浏览效果
        </Button>
        <Button
          onClick={() => {
            const values = form.getFieldsValue();
            submit({
              values,
              btn: 'copy',
              ...allTips,
            });
          }}
          type="submit"
          color="success">
          分享到微信
        </Button>
      </Space>
    </div>
  );
}
