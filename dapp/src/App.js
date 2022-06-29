import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Homepage from './Homepage';


class App extends Component {

    render() {        
             
        return (
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/:test" element={<Homepage />} />
                    </Routes>
                </BrowserRouter>
        );
    }
};


export default App;
