import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Input, message, Modal, Space } from 'antd';
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { SETUSER, UserContext } from '../../store/user';
import { useSafeProps, useSetState } from '../../utils/commonHooks';
import { signIn } from '../../utils/httpClient';
import { AuthMode } from './SignUp';
import { browserDetect } from '../../utils';

// 图标
import WechatOutlined from '../../icons/WechatOutlined';
import QQOutlined from '../../icons/QQOutlined';
import GithubOutlined from '../../icons/GithubOutlined';

// 样式
import styles from './auth.module.css';

const dividerStyle = { margin: 0, fontSize: '14px', fontWeight: 500 };

interface ISignInProps {
  switchMode: (m: AuthMode) => void;
  onCancel: () => void;
}

interface ISignInState {
  username: string;
  password: string;
}

const DXCaptcha = dynamic(() => import('./DXCaptcha'), {
  ssr: false,
});

export const SignIn: FC<ISignInProps> = (props) => {
  const userContext = useContext(UserContext);

  const safeProps = useSafeProps<ISignInProps>(props);

  const [loading, setLoading] = useState<boolean>(false);
  const [signInState, setSignInState] = useSetState<ISignInState>({
    username: '',
    password: '',
  });
  const authTimer = useRef<number>();
  const dxTokenRef = useRef<string>();
  const dxInstanceRef = useRef<any>();

  useEffect(() => {
    return () => {
      window.clearInterval(authTimer.current);
    };
  }, []);

  const onUserNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSignInState({ username: event.target.value });
      // eslint-disable-next-line
    },
    []
  );

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSignInState({ password: event.target.value });
      // eslint-disable-next-line
    },
    []
  );

  const signUp = useCallback(() => {
    safeProps.current.switchMode(AuthMode.signup);
    // eslint-disable-next-line
  }, []);

  const resetPassword = useCallback(() => {
    safeProps.current.switchMode(AuthMode.resetPassword);
    // eslint-disable-next-line
  }, []);

  const onSignInClick = useCallback(async () => {
    try {
      setLoading(true);
      const { username, password } = signInState;

      if (!username.match(/^[1][3578]\d{9}$/)) {
        throw new Error('请输入正确的手机号');
      }

      if (!password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/)) {
        throw new Error('密码至少为6位，并且要同时包含大、小写字母和数字');
      }

      if (!dxTokenRef.current) {
        setLoading(false);
        message.warn('请完成滑块验证');
        return;
      }

      const result = await signIn({
        username,
        password,
        token: dxTokenRef.current,
      });

      if (userContext.userDispatch) {
        userContext.userDispatch({ type: SETUSER, data: result.data.data });
      }

      message.success('登录成功');
      setLoading(false);

      safeProps.current.onCancel();
    } catch (ex) {
      const reason = ex as any;
      dxInstanceRef.current?.reload();
      Modal.error({
        title: '错误',
        content: reason.message,
      });
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [signInState]);

  const onQQOAuth = useCallback(() => {
    window.clearInterval(authTimer.current);
    window.localStorage.setItem('OAUTH_LOGIN_URL', window.location.href);

    const state = Math.ceil(Math.random() * 1000000);
    const { os } = browserDetect(window.navigator.userAgent);
    const display = os.phone ? 'mobile' : '';
    const newWin = window.open(
      `https://graph.qq.com/oauth2.0/authorize?client_id=101953410&redirect_uri=https%3A%2F%2Fhouhoukang.com%2Fqq%2Foauth%2Fauthorize&response_type=code&state=${state}&scope=get_user_info${
        display ? `&display=${display}` : ''
      }`
    );

    authTimer.current = window.setInterval(() => {
      if (newWin && newWin.closed) {
        window.clearInterval(authTimer.current);
        window.location.reload();
      }
    }, 300);
  }, []);

  const onWechatOAuth = useCallback(() => {
    Modal.error({
      title: '暂未开放',
      content: '微信登录权限申请中，敬请期待',
    });
  }, []);

  const onGitHubOAuth = useCallback(() => {
    window.clearInterval(authTimer.current);
    window.localStorage.setItem('OAUTH_LOGIN_URL', window.location.href);

    const newWin = window.open(
      'https://github.com/login/oauth/authorize?client_id=b0263da0ed583f782b96&redirect_uri=https://houhoukang.com/github/oauth/authorize'
    );

    authTimer.current = window.setInterval(() => {
      if (newWin && newWin.closed) {
        window.clearInterval(authTimer.current);
        window.location.reload();
      }
    }, 300);
  }, []);

  const dxCallback = useCallback((token: string) => {
    dxTokenRef.current = token;
  }, []);

  const getDXRef = useCallback((dx: any) => {
    dxInstanceRef.current = dx;
  }, []);

  return (
    <Space direction="vertical" size={12} className="uranus-width-100">
      <Input
        size="large"
        placeholder="请输入手机号"
        prefix={<UserOutlined className={styles.prefix} />}
        value={signInState.username}
        onChange={onUserNameChange}
      />
      <Input.Password
        size="large"
        placeholder="请输入密码"
        prefix={<KeyOutlined className={styles.prefix} />}
        value={signInState.password}
        onChange={onPasswordChange}
      />
      <DXCaptcha callback={dxCallback} getDXRef={getDXRef} />
      <Button
        type="primary"
        size="large"
        loading={loading}
        block
        onClick={onSignInClick}
      >
        登录
      </Button>
      <div className={styles.prompt_box}>
        <span>
          没有账号?
          <Button type="link" onClick={signUp}>
            注册
          </Button>
        </span>
        <Button type="link" onClick={resetPassword}>
          忘记密码
        </Button>
      </div>
      <p style={{ marginBottom: 0 }}>
        注册登录即表示同意<b>用户协议</b>、<b>隐私政策</b>
      </p>
      <Divider style={dividerStyle}>第三方登录</Divider>
      <div className={styles.third}>
        <Avatar
          className={styles.third_item}
          size={38}
          icon={<QQOutlined onClick={onQQOAuth} style={{ fontSize: 38 }} />}
        />
        <Avatar
          className={styles.third_item}
          size={38}
          icon={
            <WechatOutlined onClick={onWechatOAuth} style={{ fontSize: 38 }} />
          }
        />
        <Avatar
          className={styles.third_item}
          size={38}
          icon={
            <GithubOutlined onClick={onGitHubOAuth} style={{ fontSize: 38 }} />
          }
        />
      </div>
    </Space>
  );
};
