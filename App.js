import * as React from 'react';
import axios from 'axios';
import react from 'react';
import {DatePicker} from 'antd';
import { Button } from 'antd';
import { Space } from 'antd';
import styles from './style.module.scss';
import './styles.css';
import './App.css';
import { ReactComponent as Check } from './check.svg';
import { Component } from 'react';
import lines from 'svg-patterns/p/lines';
import stringify from 'virtual-dom-stringify';
 


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'Redux'
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  let isLoadingProp = false;
  React.useEffect(() =>{
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    //isLoadingProp = true;
  axios
  .get(`${API_ENDPOINT}${searchTerm}`)
  .then((result) => {
    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: result.data.hits,
    });
    setTimeout(()=> {isLoadingProp = false},2000);
  })
  .catch(() =>
    dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
  );
  
  },[]);

  const [url,setUrl] = React.useState(`$(API_ENDPOINT)${searchTerm} ${'hitsPerPage=5'}`);
  
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };


  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };
  

const handleFetchStories = React.useCallback(async ()=> {
  dispatchStories({ type: 'STORIES_FETCH_INIT' });

  try{
  const result = await axios.get(url);
    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: result.data.hits,
    })
  }
  catch{
    dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
  }
}, [url]);


  React.useEffect(() => {
   handleFetchStories();
  },[handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

   
  return (
    <>
    <BackgroundPattern pttrn={pattern}>
      <h1 class='headline-primary'>My Hacker Stories</h1>
      </BackgroundPattern>
      <div className="container">
      <SearchForm
      searchTerm={searchTerm}
      onSearchInput={handleSearchInput}
      onSearchSubmit={handleSearchSubmit} 
      />
      
      <hr />
      
      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
      <BasicSvg/>
      
    </div>
    </>
  );
};

const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit}) => (
<form onFinish={onSearchSubmit} className={styles.searchForm}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>
    
    <Button type="primary" htmlType="submit" disabled={!searchTerm}>Button</Button>
  </form>
)

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused = 'true',
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className={styles.label}>{children}</label>
      &nbsp;
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
      />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => (
  <li className='item'>
    <span style={{width: '40%'}} className="list-item">
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{width: '30%'}} className={styles["list-item"]} ><span className='rowC'><span className={styles.pad}>Author: </span>{item.author}</span></span>
    <span style={{width: '10%'}} className={styles["list-item"]}><span className='rowC'><span className={styles.pad}>Comments: </span>{item.num_comments}</span></span>
    <span style={{width: '10%'}} className={styles["list-item"]}><span className='rowC'><span className={styles.pad}>Points: </span>{item.points}</span></span>
    <span style={{width: '10%'}}>
      <button className={`${styles.button} ${styles.buttonSmall}`}  
      type="button" 
      onClick={() => onRemoveItem(item)}>
      <Check height="18px" width="18px" />
      </button>      
    </span>
  </li>
);

const BasicSvg = () =>
  <div>
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="blue"
      strokeWidth="4"
      fill="lightblue"
      className='logo'
    />
  </svg>
  </div>
 
 const pattern = lines({
  stroke: '#9c92ac',
  background: '#dfdbe5',
  orientations: [45]
});

  const BackgroundPattern = ({ children, pttrn }) =>
  <div className="patterns-container">
    <svg className="patterns-content" xmlns="http://www.w3.org/2000/svg">
      <defs dangerouslySetInnerHTML={{ __html: stringify(pttrn) }}></defs>
      <rect width="100%" height="100%" style={{ fill: pttrn.url() }}/>
    </svg>
 
    {children}
 
  </div>

export default App;