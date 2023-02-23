import { Toast, Form, Input, TextArea, Button, Space } from 'antd-mobile';

let btn;
export default function Antd({ obj, submit }) {
  return (
    <Form
      initialValues={obj}
      onFinish={(values: any) => {
        submit({
          values,
          btn,
          copyTips: () => {
            Toast.show({
              icon: 'success',
              content: '复制成功',
            });
          },
          errorTips: () => {
            Toast.show({
              icon: 'fail',
              content: '失败请联系作者',
            });
          },
        });
      }}>
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
  );
}
