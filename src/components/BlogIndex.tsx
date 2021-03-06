import { parse } from "query-string";
import * as React from "react";
import { Link } from "react-router-dom";

import { getPosts } from "../interactors/getPosts";
import { blogPath, blogsPath } from "../routes";
import { formatDate } from "../tools/formatDate";
import { reducer } from "../tools/reducer";
import { ActionType, EffectType } from "../types/global";
import { GetPostsQuery } from "../types/graphql";
import { Head } from "./Head";

interface State {
  posts: GetPostsQuery["posts"];
  currentPage: number;
}

interface Actions {
  init: (props: Props) => ActionType<State>;
  setPosts: (posts: GetPostsQuery["posts"]) => ActionType<State>;
  setCurrentPage: (currentPage: number) => ActionType<State>;
}

interface Effects {
  handleChangeCurrentPage: (currentPage: number) => EffectType<void>;
}

interface Props {
  location: {
    search: string;
  };
}

const initialState: State = {
  posts: null,
  currentPage: 0
};

const actions: Actions = {
  init: props => state => {
    const params = parse(props.location.search).page;
    const currentPage = params
      ? parseInt(params instanceof Array ? params[0] : params, 10)
      : 0;
    return {
      ...state,
      currentPage
    };
  },
  setPosts: posts => state => ({
    ...state,
    posts
  }),
  setCurrentPage: currentPage => state => ({
    ...state,
    currentPage
  })
};

const createEffects = (
  dispatch: React.Dispatch<ActionType<State>>
): Effects => ({
  handleChangeCurrentPage: currentPage => () => {
    getPosts(currentPage).then(
      result =>
        result.data &&
        result.data.posts &&
        dispatch(actions.setPosts(result.data.posts))
    );
  }
});

export const BlogIndex = (props: Props) => {
  const [state, dispatch] = React.useReducer(
    reducer<State>(),
    initialState,
    actions.init(props)
  );
  const effects = createEffects(dispatch);

  React.useEffect(effects.handleChangeCurrentPage(state.currentPage), [
    state.currentPage
  ]);

  return (
    <div>
      <Head title={"ブログ"} description={"Gettyのブログ"} url={blogsPath()} />
      <div className="bgi-Content">
        <div className="bgi-Content_title">ブログ</div>
        <div className="bgi-Content_bar" />
        <div className="bgi-Content_items">
          {state.posts &&
            state.posts.edges &&
            state.posts.edges.map(
              (post, index) =>
                post &&
                post.node && (
                  <div className="bgi-Content_item" key={index}>
                    <Link
                      to={blogPath({ id: post.node.id })}
                      className="bgi-Content_item-title"
                    >
                      {post.node.title}
                    </Link>
                    <div className="bgi-Content_item-date">
                      {formatDate(post.node.insertedAt)}
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
      <div className="bgi-Footer">
        {state.posts && state.posts.pageInfo.hasPreviousPage && (
          <Link
            className="bgi-Footer_column"
            to={{
              pathname: blogsPath(),
              search: `?page=${state.currentPage - 1}`
            }}
            onClick={() =>
              dispatch(actions.setCurrentPage(state.currentPage - 1))
            }
          >
            前のページ
          </Link>
        )}
        {state.posts && state.posts.pageInfo.hasNextPage && (
          <Link
            className="bgi-Footer_column"
            to={{
              pathname: blogsPath(),
              search: `?page=${state.currentPage + 1}`
            }}
            onClick={() =>
              dispatch(actions.setCurrentPage(state.currentPage + 1))
            }
          >
            次のページ
          </Link>
        )}
      </div>
    </div>
  );
};
