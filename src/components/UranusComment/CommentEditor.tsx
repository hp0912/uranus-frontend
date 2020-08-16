import { SmileOutlined } from '@ant-design/icons';
import { Button, message, Popover, Spin } from 'antd';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { IUranusNode, IUranusNodeType, IUserEntity } from '../../types';
import { browserDetect } from '../../utils';
import { DEFAULTAVATAR } from '../../utils/constant';
import { userSearch } from '../../utils/httpClient';
import { Emoji } from './Emoji';

// 样式
import './comment.css';

interface ICommentEditorProps {
  parentId: string;
  user: IUserEntity | null;
  avatarVisible?: boolean;
  clearEditor?: boolean;
  autoFocus?: boolean;
  onSubmit: (parentId: string, comment: { rows: IUranusNode[][] }) => Promise<void>;
}

interface ICommentEditorState {
  mentionTop: number;
  mentionLeft: number;
  mentionSearch: string;
  showEmoji: boolean;
  showMention: boolean;
}

export const CommentEditor: FC<ICommentEditorProps> = (props) => {
  const { user, avatarVisible = true } = props;

  const editorRef = useRef<HTMLDivElement>(null);
  const lastRangeRef = useRef<Range>();

  const [browserState] = useState(() => {
    return browserDetect(navigator.userAgent);
  });
  const [editorState, setEditorState] = useState<ICommentEditorState>({
    mentionTop: 0,
    mentionLeft: -1,
    mentionSearch: '',
    showEmoji: false,
    showMention: false,
  });
  const [mentionUsers, setMentionUsers] = useState<{ loading: boolean, users: IUserEntity[] }>({ loading: false, users: [] });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (props.autoFocus) {
      setEditorFocus();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const timer = setTimeout(() => {
      setMentionUsers((prevState) => {
        return Object.assign({}, prevState, { loading: true });
      });

      userSearch({ pagination: { current: 0, pageSize: 10 }, searchValue: editorState.mentionSearch }).then(result => {
        setMentionUsers({ loading: false, users: result.data.data });
      }).catch(reason => {
        message.error(reason.message);
        setMentionUsers((prevState) => {
          return Object.assign({}, prevState, { loading: false });
        });
      });
    }, 500);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [editorState.mentionSearch, user]);

  const setEditorFocus = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const calculatePosition = useCallback((range: Range): { mentionTop: number, mentionLeft: number } => {
    try {
      const editorRect = editorRef.current!.getBoundingClientRect();
      const rangeRect = range.getClientRects()[0];

      return {
        mentionTop: rangeRect.top - editorRect.top + 15,
        mentionLeft: rangeRect.left - editorRect.left + 5,
      };
    } catch {
      return {
        mentionTop: 0,
        mentionLeft: -1,
      };
    }
  }, []);

  const convertToJson = useCallback((content: NodeListOf<ChildNode>): { rows: IUranusNode[][] } => {
    const contentJSON: { rows: IUranusNode[][] } = { rows: [] };
    let rowCount = 0;

    content.forEach((node, index) => {
      if (!contentJSON.rows[rowCount]) {
        contentJSON.rows[rowCount] = [];
      }

      if (node instanceof HTMLElement) {
        if (node instanceof HTMLDivElement) {
          if (index > 0) {
            rowCount++;
            if (rowCount > 50) {
              throw new Error('评论内容超过字数限制');
            }
            contentJSON.rows[rowCount] = [];
          }
          const childNode = node.childNodes;
          if (childNode.length > 100) {
            throw new Error('评论内容超过字数限制');
          }
          childNode.forEach(cnode => {
            if (cnode instanceof Text) {
              if (cnode.data.length > 500) {
                throw new Error('评论内容超过字数限制');
              }
              contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.text, data: cnode.data });
            } else if (cnode instanceof HTMLImageElement) {
              const code = cnode.getAttribute('data-code');
              const src = cnode.getAttribute('src');
              contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.img, attr: { "data-code": code as string, src: src as string } });
            } else if (cnode instanceof HTMLSpanElement) {
              const uid = cnode.getAttribute('data-id');
              contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.span, attr: { "data-id": uid as string } });
            } else if (cnode instanceof HTMLBRElement) {
              contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.br });
            }
          });
        } else if (node instanceof HTMLImageElement) {
          const code = node.getAttribute('data-code');
          const src = node.getAttribute('src');
          contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.img, attr: { "data-code": code as string, src: src as string } });
        } else if (node instanceof HTMLSpanElement) {
          const uid = node.getAttribute('data-id');
          contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.span, attr: { "data-id": uid as string } });
        } else if (node instanceof HTMLBRElement) {
          contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.br });
        }
      } else if (node instanceof Text) {
        if (node.data.length > 500) {
          throw new Error('评论内容超过字数限制');
        }
        contentJSON.rows[rowCount].push({ nodeType: IUranusNodeType.text, data: node.data });
      }
    });

    return contentJSON;
  }, []);

  const clearEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  const onEditorInput = () => {
    const selections = window.getSelection();
    if (selections) {
      const range = selections.getRangeAt(0);
      let lastChar: string = '';
      let mentionSearch: string = '';

      try {
        if (range.startOffset > 0) {
          range.setStart(range.startContainer, range.startOffset - 1);
          lastChar = range.toString();
          if (range.startContainer instanceof Text && range.endContainer instanceof Text) {
            const rangeClone = range.cloneRange();
            rangeClone.setStart(rangeClone.startContainer, 0);
            let text = rangeClone.toString();
            const mentionIndex = text.lastIndexOf('@');

            if (mentionIndex !== -1) {
              text = text.slice(mentionIndex + 1);
              if (text.search(/\s+/) === -1) {
                mentionSearch = text;
              }
            }
          }
        }
      } catch (e) {
        console.error(e.message);
      }

      range.collapse();

      if (lastChar === '@' || mentionSearch !== '') {
        const position = calculatePosition(range);
        const newState: ICommentEditorState = Object.assign({}, editorState, position);
        newState.mentionSearch = mentionSearch;
        newState.showMention = true;
        setEditorState(newState);
      } else if (editorState.showEmoji || editorState.showMention || editorState.mentionSearch !== '') {
        const newState: ICommentEditorState = Object.assign({}, editorState, { showEmoji: false, showMention: false, mentionSearch: '' });
        setEditorState(newState);
      }
    }
  };

  const onSelect = (ev) => {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      lastRangeRef.current = range;
    }
  };

  const onFocus = () => {
    if (!lastRangeRef.current) {
      return;
    }

    const selections = window.getSelection();
    if (selections) {
      selections.removeAllRanges();
      selections.addRange(lastRangeRef.current);
    }
  };

  const onCommentSubmit = async (comment: { rows: IUranusNode[][] }) => {
    try {
      setSubmitLoading(true);

      await props.onSubmit(props.parentId, comment);

      if (props.clearEditor) {
        clearEditor();
        setSubmitLoading(false);
      }
    } catch (ex) {
      message.error(ex.message);
      setSubmitLoading(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (user === null) {
      return;
    }

    if (event.keyCode === 13) {
      const editor = editorRef.current;
      // CtrlOrCmd+Enter 提交数据
      if (event.ctrlKey || event.metaKey) {
        const content = editor!.childNodes;
        let data: { rows: IUranusNode[][] } = { rows: [] };

        try {
          data = convertToJson(content);
        } catch (ex) {
          message.error(ex.message);
        }

        onCommentSubmit(data);
      }
    }
  };

  const onSubmitClick = useCallback(() => {
    if (user === null) {
      return;
    }

    const editor = editorRef.current;
    const content = editor!.childNodes;
    let data: { rows: IUranusNode[][] } = { rows: [] };

    try {
      data = convertToJson(content);
    } catch (ex) {
      message.error(ex.message);
    }

    onCommentSubmit(data);
  }, [user, onCommentSubmit]);

  const onEmojiVisibleChange = (visible: boolean) => {
    const newState = Object.assign({}, editorState);
    newState.showEmoji = visible;
    setEditorState(newState);
  };

  const onMentionClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const p = event.target as HTMLParagraphElement;
    if (!p.className.includes('mention-item')) {
      return;
    }

    event.stopPropagation();

    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    const selections1 = window.getSelection();

    if (selections1) {
      const range = selections1.getRangeAt(0);

      if (editorState.mentionSearch) {
        try {
          range.setStart(range.endContainer, range.startOffset - editorState.mentionSearch.length - 1); // @ + mentionSearch
        } catch {
          //
        }
      }

      document.execCommand('delete');
    }

    const selections2 = window.getSelection();
    if (selections2) {
      const range = selections2.getRangeAt(0);
      let nextChar;
      const newNode = document.createElement('span');
      try {
        range.setEnd(range.endContainer, range.endOffset + 1); // 末尾+1会溢出，导致抛出异常
        nextChar = range.toString();
        range.collapse(true);
      } catch {
        //
      }

      const mUId = p.getAttribute('data-id');
      const mUName = p.getAttribute('data-name');

      if (mUId && mUName) {
        newNode.className = 'uranus-mention';
        newNode.setAttribute('data-id', mUId);
        newNode.setAttribute('data-name', mUName);
        newNode.innerText = '@' + mUName;
        newNode.setAttribute('contentEditable', 'false');
        range.insertNode(newNode);

        if (browserState.browser.safari) {
          selections2.addRange(range);
        }

        selections2.collapseToEnd();

        if (!nextChar && !newNode.nextElementSibling) {
          document.execCommand('insertHtml', undefined, '<br/>');
        }
      }
    }
  }, [browserState.browser.safari, editorState.mentionSearch]);

  const onEmojiClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const img = event.target as HTMLImageElement;
    if (!img.className.includes('emoji-element')) {
      return;
    }

    event.stopPropagation();

    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    const selections = window.getSelection();

    if (selections) {
      const range = selections.getRangeAt(0);
      const newNode = document.createElement('img');
      newNode.className = 'uranus-emoji';
      newNode.setAttribute('data-code', img.src.substr(-7, 3));
      newNode.setAttribute('src', img.src);
      range.insertNode(newNode);
      if (browserState.browser.safari) {
        selections.addRange(range);
      }
      selections.collapseToEnd();
    }

  }, [browserState.browser.safari]);

  return (
    <div className="uranus-comment-editor-container" onClick={setEditorFocus}>
      {
        avatarVisible &&
        (
          <div className="uranus-avatar-box">
            <div className="comment-avatar" style={{ backgroundImage: `url(${user && user.avatar ? user.avatar : DEFAULTAVATAR})` }} />
          </div>
        )
      }
      <div className="uranus-form-box">
        <div className="input-box">
          <div
            className="uranus-comment-editor"
            ref={editorRef}
            contentEditable={true}
            placeholder={user ? "请输入评论..." : "请先登录..."}
            onInput={onEditorInput}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onSelect={onSelect}
            dangerouslySetInnerHTML={{ __html: '' }}
          />
        </div>
        <div
          className="mention-box"
          style={{
            display: editorState.showMention ? 'block' : 'none',
            top: editorState.mentionTop,
            left: editorState.mentionLeft,
          }}
          onClick={onMentionClick}
        >
          <Spin spinning={mentionUsers.loading}>
            {
              mentionUsers.users.length > 0 && mentionUsers.users.map(muser => {
                return (
                  <p
                    className="mention-item"
                    key={muser.id}
                    data-id={muser.id}
                    data-name={muser.nickname}
                  >
                    {muser.nickname} [{muser.username}]
                  </p>
                );
              })
            }
            {
              !mentionUsers.users.length &&
              <p style={{ textAlign: "center", padding: "6px 8px", margin: 0, color: "gray" }}>没有检索到数据</p>
            }
          </Spin>
        </div>
        <div className="action-box">
          <div className="emoji">
            <div className="emoji-box">
              <Popover
                visible={editorState.showEmoji}
                onVisibleChange={onEmojiVisibleChange}
                placement="bottomLeft"
                content={<Emoji onEmojiClick={onEmojiClick} />}
                title={null}
                trigger="click"
              >
                <SmileOutlined />
              </Popover>
            </div>
          </div>
          <div className="submit">
            <span style={{ color: "#c2c2c2", marginRight: 8, fontSize: 13 }}>Ctrl or ⌘ + Enter</span>
            <Button
              type="primary"
              loading={submitLoading}
              disabled={user === null}
              onClick={onSubmitClick}
            >
              {user ? "评论" : "登录后评论"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};