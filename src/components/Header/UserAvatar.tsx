import { DownOutlined, LogoutOutlined, RobotOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu, message } from 'antd';
import React, { FC, useCallback, useContext, useState } from 'react';
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import { SETUSER, UserContext } from '../../store/user';
import { signOut } from '../../utils/httpClient';

interface IUserAvatarProps {
  isBackend: boolean;
  avatarColor: string;
  avatarSize: number;
}

const UserAvatar: FC<IUserAvatarProps & RouteComponentProps> = (props) => {
  const userContext = useContext(UserContext);
  const history = useHistory();

  const [menuDisabled, setMenuDisabled] = useState(false);

  const onBackManageClick = useCallback(() => {
    history.push(`/admin`);
  }, [history]);

  const onGoBackFrontendClick = useCallback(() => {
    history.push(`/articlelist`);
  }, [history]);

  const onSingOutClick = useCallback(async () => {
    try {
      setMenuDisabled(true);
      await signOut();

      setMenuDisabled(false);
      message.success('退出登录');

      if (userContext.userDispatch) {
        userContext.userDispatch({ type: SETUSER, data: null });
      }
    } catch (ex) {
      message.error(ex.message);
      setMenuDisabled(false);
    }
  }, []);

  const UserMenu = (
    <Menu theme="light">
      {
        userContext.userState && userContext.userState?.accessLevel > 5 && !props.isBackend &&
        (
          <Menu.Item key="backManage">
            <span onClick={onBackManageClick} >
              <RobotOutlined /> 后台管理
            </span>
          </Menu.Item>
        )
      }
      {
        props.isBackend &&
        (
          <Menu.Item key="goBackFrontend">
            <span onClick={onGoBackFrontendClick} >
              <RobotOutlined /> 返回前台
            </span>
          </Menu.Item>
        )
      }
      <Menu.Item key="signOut">
        <span onClick={onSingOutClick} >
          <LogoutOutlined /> 退出
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      disabled={menuDisabled}
      overlay={UserMenu}
    >
      <a style={{ color: props.avatarColor }} onClick={e => e.preventDefault()}>
        <Avatar className="uranus-avatar-image" size={props.avatarSize} src={userContext.userState?.avatar} />
        <span style={{ paddingLeft: 8, paddingRight: 8 }}>{userContext.userState?.nickname}</span>
        <DownOutlined />
      </a>
    </Dropdown>
  );
};

export default withRouter(UserAvatar);
