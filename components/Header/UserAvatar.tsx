import { DownOutlined, LogoutOutlined, NotificationOutlined, RobotOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Menu, message, Modal, Tooltip } from 'antd';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import { SETUSER, UserContext } from '../../store/user';
import { notificationCount, signOut } from '../../utils/httpClient';
import { UserNotification } from './UserNotification';
import { WriteIcon } from './WriteIcon';

const bodyStyle = {
  padding: '6px 8px 10px 8px',
};

interface IUserAvatarProps {
  isBackend: boolean;
  avatarColor: string;
  avatarSize: number;
}

const UserAvatar: FC<IUserAvatarProps & RouteComponentProps> = (props) => {
  const userContext = useContext(UserContext);
  const history = useHistory();

  const [menuDisabled, setMenuDisabled] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [notiVisible, setNotiVisible] = useState(false);

  useEffect(() => {
    notificationCount().then((result) => {
      setNotifications(result.data.data);
    }).catch((reason) => {
      console.error(reason);
    });

    const timer = setInterval(() => {
      notificationCount().then((result) => {
        setNotifications(result.data.data);
      }).catch((reason) => {
        console.error(reason);
      });
    }, 10000);

    return () => { clearInterval(timer); };
  }, []);

  const onArticleEditClick = useCallback(() => {
    history.push(`/article/edit/new`);
  }, [history]);

  const onUserSettingClick = useCallback(() => {
    history.push(`/user/settings`);
  }, [history]);

  const onUserHomePagesClick = useCallback(() => {
    history.push(`/user/homepages`);
  }, [history]);

  const onNotificationClick = useCallback(() => {
    setNotiVisible(true);
  }, []);

  const onCancel = useCallback(() => {
    setNotiVisible(false);
  }, []);

  const onBackManageClick = useCallback(() => {
    history.push(`/admin`);
  }, [history]);

  const onGoBackFrontendClick = useCallback(() => {
    history.push(`/frontend`);
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
      Modal.error({
        title: '错误',
        content: ex.message,
      });
      setMenuDisabled(false);
    }
  }, [userContext]);

  const UserMenu = (
    <Menu theme="light">
      <Menu.Item key="userSettings">
        <span onClick={onUserSettingClick} >
          <SettingOutlined /> 个人设置
        </span>
      </Menu.Item>
      <Menu.Item key="userHomePages">
        <span onClick={onUserHomePagesClick} >
          <UserOutlined /> 我的主页
        </span>
      </Menu.Item>
      <Menu.Item key="notification">
        <span onClick={onNotificationClick} >
          <NotificationOutlined /> 系统通知
          {
            notifications ?
              <> [<span style={{ color: "red" }}>{notifications}</span>]</> :
              null
          }
        </span>
      </Menu.Item>
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
    <div className={props.isBackend ? "uranus-user-avatar-backend" : "uranus-user-avatar-frontend"}>
      {
        !props.isBackend &&
        (
          <Tooltip className="uranus-article-edit" title="写博客">
            <WriteIcon onClick={onArticleEditClick} />
          </Tooltip>
        )
      }
      <Dropdown
        placement="bottomRight"
        trigger={['click']}
        disabled={menuDisabled}
        overlay={UserMenu}
      >
        <span style={{ color: props.avatarColor, cursor: "pointer" }} onClick={e => e.preventDefault()}>
          <Badge count={notifications ? <div className="uranus-badge">{notifications}</div> : 0}>
            <Avatar className="uranus-avatar-image" size={props.avatarSize} src={userContext.userState?.avatar} />
          </Badge>
          <span className="uranus-nickname" style={{ paddingLeft: 8, paddingRight: 8 }}>
            {
              userContext.userState && userContext.userState.nickname.length > 11 ?
                userContext.userState.nickname.substr(0, 8) + "..." :
                userContext.userState?.nickname
            }
          </span>
          <DownOutlined />
        </span>
      </Dropdown>
      <Modal
        title="通知"
        bodyStyle={bodyStyle}
        visible={notiVisible}
        destroyOnClose
        centered
        footer={null}
        onCancel={onCancel}
      >
        <UserNotification />
      </Modal>
    </div>
  );
};

export default withRouter(UserAvatar);