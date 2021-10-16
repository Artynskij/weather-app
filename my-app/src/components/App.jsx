import React from "react";
import { Input } from "./common/Input";
import { List } from "./common/List";

import "./styles.css";
import { throttle, debounce } from "lodash";
import { Loader } from "./Loader";
import { Table } from "./Table"

const OFFLINE_MODE = false;


console.clear()
// export default withFetch(App, 'https://gorest.co.in/public/v1/users')

export class App extends React.Component {
  state = {
    data: [],
    isLoading: false,
    isError: false,
    searchValue: "minsk",
    counter: 0,
    units: "metric",
    isFound: true,
  };
  
  getData = async (name) => {
    if (OFFLINE_MODE) {
      console.log({ value: this.state.searchValue });
      return;
    }

    this.setState({ isLoading: true });

    // const queryName = name ? `?city=${name}` : "";
    let q = this.state.searchValue;
    let units = this.state.units;
    let idToken = process.env.REACT_APP_OPEN_WEATHER_TOKEN
    fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${idToken}&q=${q}&units=${units}`)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }

        throw new Error("не ок");
      })
      .then(( data ) => {
        this.setState({  data: data.main,});
      })
      .catch(() => {
        this.setState({ isError: true });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  getDataDebounced = debounce(this.getData, 1500);

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.searchValue === this.state.searchValue) {
      return;
    }

    this.getDataDebounced(this.state.searchValue);
  }

  onSearchChange = ({ target: { value } }) => {
    this.setState({ searchValue: value });
    
  };

  increase = () => {
    this.setState((prev) => ({ counter: ++prev.counter }));
  };

  increaseThrottled = throttle(this.increase, 1500);

  increaseDebounced = debounce(this.increase, 1500);
  
  render() {
    const { data, isLoading, isError, searchValue } = this.state;
    return (
      <div className="App">
        <div>
          <p>{this.state.counter}</p>
          <button onClick={this.increase}>Inc</button>
          <button onClick={this.increaseThrottled}>Inc Throttled</button>
          <button onClick={this.increaseDebounced}>Inc Debounced</button>
        </div>

        <input value={searchValue} onChange={this.onSearchChange} />

        {isLoading && <Loader />}
        {isError && !isLoading && <div>Что-то пошло не так{console.log(data.main)}</div>}
        {!isError && !isLoading && (
          
          <Table data={data}/>
         )
        }
      </div>
    );
  }
}
