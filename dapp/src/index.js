import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./styles/reset.css";

const container = document.querySelector('#root');
const root = createRoot(container);

root.render(
    <Provider store={store}>
            <App />
    </Provider>
);
